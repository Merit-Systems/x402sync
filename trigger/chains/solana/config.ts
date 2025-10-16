import { USDC_MULTIPLIER } from "@/trigger/constants";
import { ChainSyncConfig, PaginationStrategy, TransferEventData } from "../../types";

function buildQuery(config: ChainSyncConfig, since: Date, now: Date, limit: number, offset?: number): string {
  return `
    {
      solana(network: ${config.chain}) {
        sent: transfers(
          options: {desc: "block.height", limit: ${limit}, offset: ${offset}}
          time: {
            since: "${since.toISOString()}"
            till: "${now.toISOString()}"
          }
          amount: {gt: 0}
          signer: {
            in: ${JSON.stringify(config.facilitators)}
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

function transformResponse(data: any, network: string): TransferEventData[] {
  return data.solana.sent.map((transfer: any) => ({
    address: transfer.currency.address,
    transaction_from: transfer.transaction.feePayer,
    sender: transfer.sender.address,
    recipient: transfer.receiver.address,
    amount: Math.round(parseFloat(transfer.amount) * USDC_MULTIPLIER),
    block_timestamp: new Date(transfer.block.timestamp.time),
    tx_hash: transfer.transaction.signature,
    chain: network,
  }));
}

export const solanaChainConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDuration: 300,
  network: "solana",
  chain: "solana",
  facilitators: [
    "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4" // PayAI
  ],
  fallbackTime: 6 * 30 * 24 * 60 * 60 * 1000,
  apiUrl: "https://graphql.bitquery.io",
  paginationStrategy: PaginationStrategy.OFFSET,
  buildQuery,
  transformResponse,
};

