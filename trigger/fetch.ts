import { logger } from "@trigger.dev/sdk";
import { ChainSyncConfig } from "./types";
import { PAGE_SIZE, TIME_WINDOW_DAYS } from "./constants";

export async function fetchWithOffsetPagination(
  config: ChainSyncConfig,
  since: Date,
  now: Date
): Promise<any[]> {
  const allTransfers = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    logger.log(`[${config.network}] Fetching with offset: ${offset}`);

    const query = config.buildQuery(config, since, now, PAGE_SIZE, offset);
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
  config: ChainSyncConfig,
  since: Date,
  now: Date
): Promise<any[]> {
  const allTransfers = [];
  let currentStart = new Date(since);
  const timeWindowMs = TIME_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  while (currentStart < now) {
    const currentEnd = new Date(Math.min(currentStart.getTime() + timeWindowMs, now.getTime()));
    
    logger.log(`[${config.network}] Fetching window: ${currentStart.toISOString()} to ${currentEnd.toISOString()}`);

    const query = config.buildQuery(config, currentStart, currentEnd, PAGE_SIZE);
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
  config: ChainSyncConfig,
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