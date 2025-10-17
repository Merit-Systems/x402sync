import { logger } from "@trigger.dev/sdk";
import { PaginationStrategy, QueryConfig, QueryProvider } from "./types";
import { PAGE_SIZE, TIME_WINDOW_DAYS } from "./constants";
import { BigQuery } from "@google-cloud/bigquery";

export async function fetchTransfers(
    config: QueryConfig,
    facilitators: string[],
    since: Date,
    now: Date
  ): Promise<any[]> {
    if (config.provider === QueryProvider.BIGQUERY) {
      return fetchWithBigQuery(config, facilitators, since, now);
    }
    
    // Default to Bitquery
    if (config.paginationStrategy === PaginationStrategy.OFFSET) {
      return fetchWithOffsetPagination(config, facilitators, since, now);
    } else {
      return fetchWithTimeWindowing(config, facilitators, since, now);
    }
  }

export async function fetchWithBigQuery(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  const bq = new BigQuery();

  const allTransfers = [];
  
  // BigQuery queries can handle all facilitators in one query,
  // but current architecture fetches per facilitator
  for (const facilitator of facilitators) {
    logger.log(`[${config.network}] Fetching BigQuery data for facilitator: ${facilitator}`);
    
    const query = config.buildQuery(config, [facilitator], since, now, 1000);

    logger.log(`[${config.network}] BigQuery query: ${query}`);
    
    const [rows] = await bq.query({
      query,
    });
    
    logger.log(`[${config.network}] BigQuery returned ${rows.length} rows`);
    
    allTransfers.push(...config.transformResponse(rows, config.network));
  }
  
  return allTransfers;
}

export async function fetchWithOffsetPagination(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  const allTransfers = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    logger.log(`[${config.network}] Fetching with offset: ${offset}`);

    const query = config.buildQuery(config, facilitators, since, now, PAGE_SIZE, offset);
    const transfers = await executeBitqueryRequest(config, query);

    allTransfers.push(...transfers);

    if (transfers.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      offset += PAGE_SIZE;
    }

  }
  
  return allTransfers;
}

export async function fetchWithTimeWindowing(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  const allTransfers = [];
  let currentStart = new Date(since);
  const timeWindowMs = TIME_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  while (currentStart < now) {
    const currentEnd = new Date(Math.min(currentStart.getTime() + timeWindowMs, now.getTime()));
    
    logger.log(`[${config.network}] Fetching window: ${currentStart.toISOString()} to ${currentEnd.toISOString()}`);

    const query = config.buildQuery(config, facilitators, currentStart, currentEnd, PAGE_SIZE);
    const transfers = await executeBitqueryRequest(config, query);

    allTransfers.push(...transfers);
    logger.log(`[${config.network}] Fetched ${transfers.length} transfers in this time window`);

    // If we got the full PAGE_SIZE, this window has more data
    if (transfers.length >= PAGE_SIZE) {
      logger.warn(`[${config.network}] Window returned ${transfers.length} transfers (at or above limit). Some data might be missing. Consider reducing TIME_WINDOW_DAYS.`);
    }

    currentStart = currentEnd;
  }

  return allTransfers;
}

async function executeBitqueryRequest(
  config: QueryConfig,
  query: string
): Promise<any[]> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${process.env.BITQUERY_API_KEY}`);

  const rawQuery = JSON.stringify({ query });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: rawQuery,
  };

  const response = await fetch(config.apiUrl, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`[${config.network}] Bitquery API error (${response.status}):`, { error: errorText });
    throw new Error(`Bitquery API returned ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  if (result.errors) {
    logger.error(`[${config.network}] Bitquery GraphQL errors:`, { errors: result.errors });
    throw new Error(`Bitquery GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return config.transformResponse(result.data, config.network);
}