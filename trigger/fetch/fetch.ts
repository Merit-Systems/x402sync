import {
  SyncConfig,
  Facilitator,
  PaginationStrategy,
  QueryProvider,
  TransferEventData,
} from '../types';
import { fetchWithOffsetPagination, fetchBitquery } from './bitquery/fetch';
import { fetchBigQuery } from './bigquery/fetch';
import { logger } from '@trigger.dev/sdk';
import { fetchCDP } from './cdp/fetch';

export async function fetchTransfers(
  config: SyncConfig,
  facilitator: Facilitator,
  since: Date,
  now: Date,
  onBatchFetched?: (batch: TransferEventData[]) => Promise<void>
): Promise<{ totalFetched: number }> {
  const strategy = config.paginationStrategy;

  if (strategy === PaginationStrategy.TIME_WINDOW) {
    return fetchWithWindow(config, facilitator, since, now, onBatchFetched);
  }

  if (strategy === PaginationStrategy.OFFSET) {
    return fetchWithOffset(config, facilitator, since, now, onBatchFetched);
  }

  throw new Error(`Unsupported pagination strategy: ${strategy as string}`);
}

async function fetchWithWindow(
  config: SyncConfig,
  facilitator: Facilitator,
  since: Date,
  now: Date,
  onBatchFetched?: (batch: TransferEventData[]) => Promise<void>
): Promise<{ totalFetched: number }> {
  const provider = config.provider;
  let currentStart = new Date(since);
  const timeWindowMs = config.timeWindowInMs!;
  let totalFetched = 0;

  while (currentStart < now) {
    const currentEnd = new Date(
      Math.min(currentStart.getTime() + timeWindowMs, now.getTime())
    );

    logger.log(
      `[${config.chain}] Fetching window: ${currentStart.toISOString()} to ${currentEnd.toISOString()}`
    );

    let results: TransferEventData[] | undefined;

    if (provider === QueryProvider.BIGQUERY) {
      results = await fetchBigQuery(
        config,
        facilitator,
        currentStart,
        currentEnd
      );
    }
    if (provider === QueryProvider.BITQUERY) {
      results = await fetchBitquery(
        config,
        facilitator,
        currentStart,
        currentEnd
      );
    }
    if (provider === QueryProvider.CDP) {
      results = await fetchCDP(config, facilitator, currentStart, currentEnd);
    }

    if (!results) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    totalFetched += results.length;
    logger.log(
      `[${config.chain}] Fetched ${results.length} results in this time window`
    );

    if (onBatchFetched && results.length > 0) {
      await onBatchFetched(results);
    }

    if (results.length >= config.limit) {
      logger.warn(
        `[${config.chain}] Window hit limit of ${config.limit}. Some data might be missing.`
      );
    }

    currentStart = currentEnd;
  }

  return { totalFetched };
}

async function fetchWithOffset(
  config: SyncConfig,
  facilitator: Facilitator,
  since: Date,
  now: Date,
  onBatchFetched?: (batch: TransferEventData[]) => Promise<void>
): Promise<{ totalFetched: number }> {
  if (config.provider !== QueryProvider.BITQUERY) {
    throw new Error(
      `Offset pagination only supported for Bitquery, not ${config.provider}`
    );
  }

  const results = await fetchWithOffsetPagination(
    config,
    facilitator,
    since,
    now
  );

  if (onBatchFetched && results.length > 0) {
    await onBatchFetched(results);
  }

  return { totalFetched: results.length };
}
