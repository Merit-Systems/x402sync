import { logger } from "@trigger.dev/sdk/v3";
import { QueryConfig } from "../../types";
import { PAGE_SIZE, TIME_WINDOW_DAYS } from "../../constants";

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
    logger.log(`[${config.chain}] Fetching with offset: ${offset}`);

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
    
    logger.log(`[${config.chain}] Fetching window: ${currentStart.toISOString()} to ${currentEnd.toISOString()}`);

    const query = config.buildQuery(config, facilitators, currentStart, currentEnd, PAGE_SIZE);
    const transfers = await executeBitqueryRequest(config, query);

    allTransfers.push(...transfers);
    logger.log(`[${config.chain}] Fetched ${transfers.length} transfers in this time window`);

    // If we got the full PAGE_SIZE, this window has more data
    if (transfers.length >= PAGE_SIZE) {
      logger.warn(`[${config.chain}] Window returned ${transfers.length} transfers (at or above limit). Some data might be missing. Consider reducing TIME_WINDOW_DAYS.`);
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
    logger.error(`[${config.chain}] Bitquery API error (${response.status}):`, { error: errorText });
    throw new Error(`Bitquery API returned ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  if (result.errors) {
    logger.error(`[${config.chain}] Bitquery GraphQL errors:`, { errors: result.errors });
    throw new Error(`Bitquery GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return config.transformResponse(result.data, config.chain);
}
