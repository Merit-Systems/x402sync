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
    .map((addr) => `transaction_from = '${addr.toLowerCase()}'`)
    .join(" OR ");

  // Format dates for CDP SQL: YYYY-MM-DD HH:MM:SS.mmm
  const formatDateForSql = (date: Date) => {
    return date.toISOString().replace('T', ' ').replace('Z', '');
  };

  return `
    SELECT
      address AS contract_address,
      parameters['from']::String AS sender,
      transaction_from,
      parameters['to']::String AS to_address,
      transaction_hash,
      block_timestamp,
      parameters['value']::UInt256 AS amount
    FROM base.events
    WHERE event_signature = '${TRANSFER_EVENT_SIG}'
      AND address = '${USDC_BASE.toLowerCase()}'
      AND (${facilitatorsFilter})
      AND block_timestamp >= '${formatDateForSql(since)}'
      AND block_timestamp < '${formatDateForSql(now)}'
    ORDER BY block_timestamp DESC
    LIMIT ${limit};
  `;
}

function transformResponse(data: any[], network: string): TransferEventData[] {
  return data.map((row: any) => ({
    address: row.contract_address,
    transaction_from: row.transaction_from,
    sender: row.sender,
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
  apiUrl: "api.cdp.coinbase.com",
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowMs: 24 * 60 * 60 * 1000, // 1 day
  facilitators: [
    "0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6",
  ],
  syncStartDate: new Date('2025-10-01'),
  buildQuery,
  transformResponse,
};