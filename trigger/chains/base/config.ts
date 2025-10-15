import { ChainSyncConfig, TransferEventData } from "../../types";

const BASE_BITQUERY_API_URL = "https://streaming.bitquery.io/graphql";
const BASE_NETWORK = "base";
const BASE_FACILITATORS = [
    "0xD8Dfc729cBd05381647EB5540D756f4f8Ad63eec" // Coinbase
];
const BASE_SYNC_TASK_ID = "base-sync-transfers";
const BASE_SYNC_INTERVAL = "*/30 * * * *";
const BASE_SYNC_MAX_DURATION = 1000; // in seconds
const BASE_SYNC_FALLBACK_TIME = 6 * 30 * 24 * 60 * 60 * 1000; // in milliseconds

function buildQuery(since: Date, now: Date, facilitators: string[]): string {
  return `
    {
      EVM(network: base, dataset: combined) {
        Transfers(
          where: {
            Transaction: {
              From: {in: ${JSON.stringify(facilitators)}}
              Time: {
                since: "${since.toISOString()}"
                till: "${now.toISOString()}"
              }
            }
          }
          orderBy: {descending: Block_Number}
          limit: {count: 20000}
        ) {
          Transfer {
            Amount
            Sender
            Receiver
            Currency {
              Name
              SmartContract
              Symbol
            }
          }
          Block {
            Date
            Number
          }
          Transaction {
            Hash
            From
          }
        }
      }
    }
  `;
}

function transformResponse(data: any): TransferEventData[] {
  return data.EVM.Transfers.map((item: any) => ({
    address: item.Transfer.Currency?.SmartContract || "0x0000000000000000000000000000000000000000",
    transaction_from: item.Transaction.From,
    sender: item.Transfer.Sender,
    recipient: item.Transfer.Receiver,
    amount: parseFloat(item.Transfer.Amount),
    block_timestamp: new Date(item.Block.Date),
    tx_hash: item.Transaction.Hash,
    chain: "base",
  }));
}

export const baseChainConfig: ChainSyncConfig = {
  taskId: BASE_SYNC_TASK_ID,
  cron: BASE_SYNC_INTERVAL,
  maxDuration: BASE_SYNC_MAX_DURATION,
  network: BASE_NETWORK,
  facilitators: BASE_FACILITATORS,
  fallbackTime: BASE_SYNC_FALLBACK_TIME,
  apiUrl: BASE_BITQUERY_API_URL,
  buildQuery,
  transformResponse,
};

