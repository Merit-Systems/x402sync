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

export interface ChainSyncConfig {
  cron: string;
  maxDuration: number;
  
  network: string;
  facilitators: string[];
  fallbackTime: number;
  apiUrl: string;
  
  buildQuery: (since: Date, now: Date, facilitators: string[], limit: number) => string;
  transformResponse: (data: any, network: string) => TransferEventData[];
}