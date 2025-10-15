import { ChainSyncConfig, TransferEventData } from "../../types";

const SOLANA_BITQUERY_API_URL = "https://graphql.bitquery.io";
const SOLANA_NETWORK = "solana";
const SOLANA_FACILITATORS = [
    "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4" // PayAI
];
const SOLANA_SYNC_TASK_ID = "solana-sync-transfers";
const SOLANA_SYNC_INTERVAL = "*/30 * * * *";
const SOLANA_SYNC_MAX_DURATION = 300; // in seconds
const SOLANA_SYNC_FALLBACK_TIME = 6 * 30 * 24 * 60 * 60 * 1000; // in milliseconds

function buildQuery(since: Date, now: Date, facilitators: string[]): string {
  return `
    {
      solana(network: solana) {
        sent: transfers(
          options: {desc: "block.height", limit: 20000, offset: 0}
          time: {
            since: "${since.toISOString()}"
            till: "${now.toISOString()}"
          }
          amount: {gt: 0}
          signer: {
            in: ${JSON.stringify(facilitators)}
          }
        ) {
          block {
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
            }
            height
          }
          sender {
            address
          }
          receiver {
            address
          }
          amount
          currency {
            name
            address
            symbol
          }
          transaction {
            feePayer
            signature
          }
        }
      }
    }
  `;
}

function transformResponse(data: any): TransferEventData[] {
  return data.solana.sent.map((transfer: any) => ({
    address: transfer.currency.address,
    transaction_from: transfer.transaction.feePayer,
    sender: transfer.sender.address,
    recipient: transfer.receiver.address,
    amount: parseFloat(transfer.amount),
    block_timestamp: new Date(transfer.block.timestamp.time),
    tx_hash: transfer.transaction.signature,
    chain: "solana",
  }));
}

export const solanaChainConfig: ChainSyncConfig = {
  taskId: SOLANA_SYNC_TASK_ID,
  cron: SOLANA_SYNC_INTERVAL,
  maxDuration: SOLANA_SYNC_MAX_DURATION,
  network: SOLANA_NETWORK,
  facilitators: SOLANA_FACILITATORS,
  fallbackTime: SOLANA_SYNC_FALLBACK_TIME,
  apiUrl: SOLANA_BITQUERY_API_URL,
  buildQuery,
  transformResponse,
};

