export interface TransferEventData {
  address: string;
  transaction_from: string;
  sender: string;
  recipient: string;
  amount: number;
  block_timestamp: Date;
  tx_hash: string;
  chain: string;
  provider: string;
  decimals: number;
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
  apiUrl?: string;
  buildQuery: (config: ChainSyncConfig, facilitators: string[], since: Date, now: Date, offset?: number) => string;
  transformResponse: (data: any, config: ChainSyncConfig) => TransferEventData[];
}

interface TimeWindowQueryConfig extends BaseQueryConfig {
  paginationStrategy: PaginationStrategy.TIME_WINDOW;
  timeWindowInMs: number;
}

interface OffsetQueryConfig extends BaseQueryConfig {
  paginationStrategy: PaginationStrategy.OFFSET;
  timeWindowInMs?: never;
}

export type QueryConfig = TimeWindowQueryConfig | OffsetQueryConfig;

export type ChainSyncConfig = QueryConfig & {
  cron: string;
  maxDurationInSeconds: number;
  facilitators: FacilitatorConfig[];
  limit: number;
}

export interface EvmChainConfig {
    cron: string;
    maxDuration: number;
    network: string;
    chain: string;
    facilitators: FacilitatorConfig[];
}

export interface FacilitatorConfig {
  id: string;
  syncStartDate: Date;
  enabled: boolean;
  address: string;
}