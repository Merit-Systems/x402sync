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

export interface ChainSyncConfig {
  cron: string;
  maxDuration: number;
  
  network: string;
  facilitators: string[];
  fallbackTime: number;
  apiUrl: string;
  paginationStrategy: PaginationStrategy;
  
  buildQuery: (since: Date, now: Date, facilitators: string[], limit: number, offset?: number) => string;
  transformResponse: (data: any, network: string) => TransferEventData[];
}