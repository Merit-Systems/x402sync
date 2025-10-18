import { PaginationStrategy, QueryConfig, QueryProvider } from "../types";
import { fetchWithOffsetPagination, fetchWithTimeWindowingBitquery } from "./bitquery/fetch";
import { fetchWithTimeWindowingBigQuery } from "./bigquery/fetch";
import { logger } from "@trigger.dev/sdk";

export async function fetchTransfers(
    config: QueryConfig,
    facilitators: string[],
    since: Date,
    now: Date
  ): Promise<any[]> {
    if (config.paginationStrategy === PaginationStrategy.TIME_WINDOW) {
      if (config.provider === QueryProvider.BIGQUERY) {
        return fetchWithTimeWindowingBigQuery(config, facilitators, since, now);
      }
      
      if (config.provider === QueryProvider.BITQUERY) {
        return fetchWithTimeWindowingBitquery(config, facilitators, since, now);
      }

      throw new Error(`Unsupported provider for time windowing: ${config.provider}`);
    }

    if (config.paginationStrategy === PaginationStrategy.OFFSET) {
      if (config.provider !== QueryProvider.BITQUERY) {
        throw new Error(`Offset pagination only supported for Bitquery, not ${config.provider}`);
      }
      return fetchWithOffsetPagination(config, facilitators, since, now);
    }

    throw new Error(`Unsupported pagination strategy: ${config.paginationStrategy}`);
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
  
