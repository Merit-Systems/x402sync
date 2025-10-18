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

export interface QueryConfig {
  chain: string;
  provider: QueryProvider;
  apiUrl: string;
  paginationStrategy?: PaginationStrategy;
  timeWindowMs?: number; // Time window in milliseconds for time-window pagination
  buildQuery: (config: QueryConfig, facilitators: string[], since: Date, now: Date, limit: number, offset?: number) => string;
  transformResponse: (data: any, network: string) => TransferEventData[];
}

export interface ChainSyncConfig extends QueryConfig {
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