import { ChainSyncConfig, TransferEventData } from "../../types";

function buildQuery(since: Date, now: Date, facilitators: string[]): string {
  return `
    {
      EVM(network: matic, dataset: combined) {
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

function transformResponse(data: any, network: string): TransferEventData[] {
  return data.EVM.Transfers.map((item: any) => ({
    address: item.Transfer.Currency?.SmartContract || "0x0000000000000000000000000000000000000000",
    transaction_from: item.Transaction.From,
    sender: item.Transfer.Sender,
    recipient: item.Transfer.Receiver,  
    amount: parseFloat(item.Transfer.Amount),
    block_timestamp: new Date(item.Block.Time),
    tx_hash: item.Transaction.Hash,
    chain: network,
  }));
}

export const polygonChainConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDuration: 1000,
  network: "polygon",
  facilitators: [
    "0xD8Dfc729cBd05381647EB5540D756f4f8Ad63eec" // Coinbase
  ],
  fallbackTime: 6 * 30 * 24 * 60 * 60 * 1000,
  apiUrl: "https://streaming.bitquery.io/graphql",
  buildQuery,
  transformResponse,
};