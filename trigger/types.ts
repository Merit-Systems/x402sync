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
  taskId: string;
  cron: string;
  maxDuration: number;
  
  network: string;
  facilitators: string[];
  fallbackTime: number;
  apiUrl: string;
  
  buildQuery: (since: Date, now: Date, facilitators: string[]) => string;
  transformResponse: (data: any) => TransferEventData[];
}

