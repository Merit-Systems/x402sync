import { USDC_MULTIPLIER } from '@/trigger/constants';
import {
  SyncConfig,
  Facilitator,
  PaginationStrategy,
  QueryProvider,
  TransferEventData,
  Chain,
  BitQueryTransferRow,
} from '../../../types';
import { FACILITATORS } from '@/trigger/config';

function buildQuery(
  config: SyncConfig,
  facilitator: Facilitator,
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

function transformResponse(
  data: unknown,
  config: SyncConfig,
  facilitator: Facilitator
): TransferEventData[] {
  return (data as BitQueryTransferRow[]).map(transfer => ({
    address: transfer.currency.address,
    transaction_from: transfer.transaction.feePayer,
    sender: transfer.sender.address,
    recipient: transfer.receiver.address,
    amount: Math.round(parseFloat(transfer.amount) * USDC_MULTIPLIER),
    block_timestamp: new Date(transfer.block.timestamp.time),
    tx_hash: transfer.transaction.signature,
    chain: config.chain,
    provider: config.provider,
    decimals: facilitator.token.decimals,
    facilitator_id: facilitator.id,
  }));
}

export const solanaChainConfig: SyncConfig = {
  cron: '*/30 * * * *',
  maxDurationInSeconds: 300,
  chain: 'solana',
  provider: QueryProvider.BITQUERY,
  apiUrl: 'https://graphql.bitquery.io',
  paginationStrategy: PaginationStrategy.OFFSET,
  limit: 20_000,
  facilitators: FACILITATORS.filter(f => f.chain === Chain.SOLANA),
  buildQuery,
  transformResponse,
};
