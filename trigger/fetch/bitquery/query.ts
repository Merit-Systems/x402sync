import { DEFAULT_CONTRACT_ADDRESS, USDC_MULTIPLIER } from "@/trigger/constants";
import { SyncConfig, EvmChainConfig, Facilitator, PaginationStrategy, QueryProvider, TransferEventData } from "@/trigger/types";

export function buildQuery(
    config: SyncConfig,
    facilitator: Facilitator,
    since: Date,
    now: Date,
): string {
  return `
    {
      EVM(network: ${config.chain}, dataset: combined) {
        Transfers(
          limit: {count: ${config.limit}}
          where: {
            Transaction: {
              From: {in: ${JSON.stringify(facilitator.address)}}
              Time: {
                since: "${since.toISOString()}"
                till: "${now.toISOString()}"
              }
            }
          }
          orderBy: {descending: Block_Number}
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
            Time
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

export function transformResponse(data: any, config: SyncConfig): TransferEventData[] {
  return data.EVM.Transfers.map((item: any) => ({
    address: item.Transfer.Currency?.SmartContract || DEFAULT_CONTRACT_ADDRESS,
    transaction_from: item.Transaction.From,
    sender: item.Transfer.Sender,
    recipient: item.Transfer.Receiver,
    amount: Math.round(parseFloat(item.Transfer.Amount) * USDC_MULTIPLIER),
    block_timestamp: new Date(item.Block.Time),
    tx_hash: item.Transaction.Hash,
    chain: config.chain,
    provider: config.provider,
  }));
}

export function createEvmChainConfig(params: EvmChainConfig): SyncConfig {
    return {
        ...params,
        apiUrl: "https://streaming.bitquery.io/graphql",
        paginationStrategy: PaginationStrategy.TIME_WINDOW,
        provider: QueryProvider.BITQUERY,
        timeWindowInMs: 7 * 24 * 60 * 60 * 1000, // 1 week
        buildQuery,
        transformResponse,
        maxDurationInSeconds: 300,
        limit: 20_000,
    }
}