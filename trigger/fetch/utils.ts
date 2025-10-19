import { logger } from "@trigger.dev/sdk/v3";
import { QueryConfig } from "../types";

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
  const timeWindowMs = config.timeWindowInMs!;

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

