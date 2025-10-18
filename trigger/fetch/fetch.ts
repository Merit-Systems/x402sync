import { PaginationStrategy, QueryConfig, QueryProvider } from "../types";
import { fetchWithOffsetPagination, fetchWithTimeWindowingBitquery } from "./bitquery/fetch";
import { fetchWithTimeWindowingBigQuery } from "./bigquery/fetch";
import { logger } from "@trigger.dev/sdk";
import { fetchWithTimeWindowingCDP } from "./cdp/fetch";

export async function fetchTransfers(
    config: QueryConfig,
    facilitators: string[],
    since: Date,
    now: Date
  ): Promise<any[]> {
    const strategy = config.paginationStrategy;
    const provider = config.provider;

    if (strategy === PaginationStrategy.TIME_WINDOW) {
      if (provider === QueryProvider.BIGQUERY) {
        return fetchWithTimeWindowingBigQuery(config, facilitators, since, now);
      }
      
      if (provider === QueryProvider.BITQUERY) {
        return fetchWithTimeWindowingBitquery(config, facilitators, since, now);
      }

      if (provider === QueryProvider.CDP) {
        return fetchWithTimeWindowingCDP(config, facilitators, since, now);
      }

      throw new Error(`Unsupported provider for time windowing: ${provider}`);
    }

    if (strategy === PaginationStrategy.OFFSET) {
      if (provider !== QueryProvider.BITQUERY) {
        throw new Error(`Offset pagination only supported for Bitquery, not ${provider}`);
      }
      return fetchWithOffsetPagination(config, facilitators, since, now);
    }

    throw new Error(`Unsupported pagination strategy: ${strategy as string}`);
  }

  export async function fetchWithTimeWindowing(
    config: QueryConfig,
    facilitators: string[],
    since: Date,
    now: Date,
    limit: number,
    executeQuery: (query: string) => Promise<any[]>
  ): Promise<any[]> {
    const allTransfers = [];
    let currentStart = new Date(since);
    const timeWindowMs = config.timeWindowMs!;
  
    while (currentStart < now) {
      const currentEnd = new Date(Math.min(currentStart.getTime() + timeWindowMs, now.getTime()));
      
      logger.log(`[${config.chain}] Fetching window: ${currentStart.toISOString()} to ${currentEnd.toISOString()}`);
  
      const query = config.buildQuery(config, facilitators, currentStart, currentEnd, limit);
      const results = await executeQuery(query);
  
      allTransfers.push(...results);
      logger.log(`[${config.chain}] Fetched ${results.length} results in this time window`);
  
      if (results.length >= limit) {
        logger.warn(`[${config.chain}] Window returned ${results.length} results (at or above limit of ${limit}). Some data might be missing. Consider reducing TIME_WINDOW_DAYS or increasing the limit.`);
      }
  
      currentStart = currentEnd;
    }
  
    return allTransfers;
  }
  
