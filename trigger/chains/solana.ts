import { ChainSyncConfig, TransferEventData } from "../types";
import {
  SOLANA_FACILITATORS,
  SOLANA_NETWORK,
  SOLANA_SYNC_FALLBACK_TIME,
  SOLANA_SYNC_INTERVAL,
  SOLANA_SYNC_MAX_DURATION,
  SOLANA_SYNC_TASK_ID,
  SOLANA_BITQUERY_API_URL,
} from "../constants";

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

