import { ChainSyncConfig, TransferEventData } from "../../types";

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
            Number
            Time
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
    address: item.Transfer.Currency?.SmartContract || "0x0000000000000000000000000000000000000000",
    transaction_from: item.Transaction.From,
    sender: item.Transfer.Sender,
    recipient: item.Transfer.Receiver,
    amount: Math.round(parseFloat(item.Transfer.Amount) * 1_000_000),
    block_timestamp: new Date(item.Block.Time),
    tx_hash: item.Transaction.Hash,
    chain: network,
  }));
}

export const baseChainConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDuration: 1000,
  network: "base",
  facilitators: [
    "0xD8Dfc729cBd05381647EB5540D756f4f8Ad63eec", // x402rs
    "0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6", // coinbase
    "0xc6699d2aada6c36dfea5c248dd70f9cb0235cb63", // payAI
    "0x222c4367a2950f3b53af260e111fc3060b0983ff"  // aurracloud
  ],
  fallbackTime: 6 * 30 * 24 * 60 * 60 * 1000,
  apiUrl: "https://streaming.bitquery.io/graphql",
  buildQuery,
  transformResponse,
};