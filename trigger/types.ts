export interface TransferEventData {
  address: string;
  transaction_from: string;
  sender: string;
  recipient: string;
  amount: number;
  block_timestamp: Date;
  tx_hash: string;
  chain: string;
}

export enum PaginationStrategy {
  TIME_WINDOW = 'time-window',
  OFFSET = 'offset',
}

export enum QueryProvider {
    BITQUERY = 'bitquery',
    BIGQUERY = 'bigquery',
    CDP = 'cdp',
}

interface BaseQueryConfig {
  chain: string;
  provider: QueryProvider;
  apiUrl: string;
  buildQuery: (config: QueryConfig, facilitators: string[], since: Date, now: Date, limit: number, offset?: number) => string;
  transformResponse: (data: any, network: string) => TransferEventData[];
}

interface TimeWindowQueryConfig extends BaseQueryConfig {
  paginationStrategy: PaginationStrategy.TIME_WINDOW;
  timeWindowMs: number;
}

interface OffsetQueryConfig extends BaseQueryConfig {
  paginationStrategy: PaginationStrategy.OFFSET;
  timeWindowMs?: never;
}

export type QueryConfig = TimeWindowQueryConfig | OffsetQueryConfig;

export type ChainSyncConfig = QueryConfig & {
  cron: string;
  maxDuration: number;
  syncStartDate: Date;
  facilitators: string[];
}

export interface EvmChainConfig {
    cron: string;
    maxDuration: number;
    network: string;
    chain: string;
    facilitators: string[];
    syncStartDate: Date;
}