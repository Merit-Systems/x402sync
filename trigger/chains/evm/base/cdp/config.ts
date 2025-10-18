import { TRANSFER_EVENT_SIG, USDC_BASE } from "@/trigger/constants";
import {
  ChainSyncConfig,
  PaginationStrategy,
  QueryConfig,
  QueryProvider,
  TransferEventData,
} from "@/trigger/types";


function buildQuery(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date,
  limit: number,
  offset?: number
): string {
  const facilitatorsFilter = facilitators
    .map((addr) => `from_address = '${addr.toLowerCase()}'`)
    .join(" OR ");

  return `
    SELECT
      contract_address,
      from_address,
      to_address,
      transaction_hash,
      block_timestamp,
      parameters['value']::UInt256 AS amount
    FROM base.events
    WHERE event_signature = '${TRANSFER_EVENT_SIG}'
      AND contract_address = '${USDC_BASE.toLowerCase()}'
      AND (${facilitatorsFilter})
      AND block_timestamp >= '${since.toISOString()}'
      AND block_timestamp < '${now.toISOString()}'
    ORDER BY block_timestamp DESC
    LIMIT ${limit};
  `;
}

function transformResponse(data: any[], network: string): TransferEventData[] {
  return data.map((row: any) => ({
    address: row.contract_address,
    transaction_from: row.from_address,
    sender: row.from_address,
    recipient: row.to_address,
    amount: Math.round(parseFloat(row.amount) / Math.pow(10, 6)), // USDC has 6 decimals
    block_timestamp: new Date(row.block_timestamp),
    tx_hash: row.transaction_hash,
    chain: network,
  }));
}

export const baseCdpConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDuration: 300,
  chain: "base",
  provider: QueryProvider.CDP,
  apiUrl: "api.developer.coinbase.com",
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowMs: 24 * 60 * 60 * 1000, // 1 day
  facilitators: [
    // Add your Base facilitator addresses here
    "0xYourFacilitatorAddress",
  ],
  syncStartDate: new Date('2025-04-01'),
  buildQuery,
  transformResponse,
};