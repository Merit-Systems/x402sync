import { USDC_MULTIPLIER, USDC_SOLANA_TOKEN } from "@/trigger/constants";
import { ChainSyncConfig, FacilitatorConfig, PaginationStrategy, QueryConfig, QueryProvider, TransferEventData } from "../../../types";

function buildQuery(
  config: ChainSyncConfig,
  facilitator: FacilitatorConfig,
  since: Date,
  now: Date,
  offset?: number
): string {
  return `
    {
      solana(network: ${config.chain}) {
        sent: transfers(
          options: {desc: "block.height", limit: ${config.limit}, offset: ${offset}}
          time: {
            since: "${since.toISOString()}"
            till: "${now.toISOString()}"
          }
          amount: {gt: 0}
          signer: {
            in: ${JSON.stringify(facilitator.address)}
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

function transformResponse(data: any, config: ChainSyncConfig): TransferEventData[] {
  return data.solana.sent.map((transfer: any) => ({
    address: transfer.currency.address,
    transaction_from: transfer.transaction.feePayer,
    sender: transfer.sender.address,
    recipient: transfer.receiver.address,
    amount: Math.round(parseFloat(transfer.amount) * USDC_MULTIPLIER),
    block_timestamp: new Date(transfer.block.timestamp.time),
    tx_hash: transfer.transaction.signature,
    chain: config.chain,
    provider: config.provider,
  }));
}

export const solanaChainConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDurationInSeconds: 300,
  chain: "solana",
  provider: QueryProvider.BITQUERY,
  apiUrl: "https://graphql.bitquery.io",
  paginationStrategy: PaginationStrategy.OFFSET,
  limit: 20_000,
  facilitators: [
    {
        id: "payAI",
        syncStartDate: new Date('2025-04-01'),
        enabled: false,
        address: "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4",
        token: USDC_SOLANA_TOKEN,
    }
  ],
  buildQuery,
  transformResponse,
};

