import { FACILITATORS } from '@/trigger/config';
import {
  SyncConfig,
  PaginationStrategy,
  QueryProvider,
  Chain,
} from '@/trigger/types';
import { buildQuery, transformResponse } from './query';
import { ONE_DAY_IN_MS } from '@/trigger/constants';

export const polygonBigQueryConfig: SyncConfig = {
  cron: '*/30 * * * *',
  maxDurationInSeconds: 300,
  chain: 'polygon',
  provider: QueryProvider.BIGQUERY,
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowInMs: ONE_DAY_IN_MS * 7,
  limit: 20_000,
  facilitators: FACILITATORS.filter(f => f.chain === Chain.POLYGON),
  buildQuery,
  transformResponse,
};
