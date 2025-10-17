import { DEFAULT_CONTRACT_ADDRESS, USDC_MULTIPLIER } from "@/trigger/constants";
import { ChainSyncConfig, EvmChainConfig, PaginationStrategy, QueryConfig, QueryProvider, TransferEventData } from "@/trigger/types";

export function buildQuery(
    config: QueryConfig,
    facilitators: string[],
    since: Date,
    now: Date,
    limit: number,
    offset?: number
): string {
  return `
    {
      EVM(network: ${config.chain}, dataset: combined) {
        Transfers(
          limit: {count: ${limit}}
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

export function transformResponse(data: any, network: string): TransferEventData[] {
  return data.EVM.Transfers.map((item: any) => ({
    address: item.Transfer.Currency?.SmartContract || DEFAULT_CONTRACT_ADDRESS,
    transaction_from: item.Transaction.From,
    sender: item.Transfer.Sender,
    recipient: item.Transfer.Receiver,
    amount: Math.round(parseFloat(item.Transfer.Amount) * USDC_MULTIPLIER),
    block_timestamp: new Date(item.Block.Time),
    tx_hash: item.Transaction.Hash,
    chain: network,
  }));
}

export function createEvmChainConfig(params: EvmChainConfig): ChainSyncConfig {
    return {
        ...params,
        apiUrl: "https://streaming.bitquery.io/graphql",
        paginationStrategy: PaginationStrategy.TIME_WINDOW,
        provider: QueryProvider.BITQUERY,
        buildQuery,
        transformResponse,
    }
}