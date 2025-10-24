import { FACILITATORS } from '@/trigger/config';
import {
  USDC_DECIMALS,
  USDC_MULTIPLIER,
  USDC_POLYGON,
} from '@/trigger/constants';
import {
  SyncConfig,
  Facilitator,
  PaginationStrategy,
  QueryProvider,
  TransferEventData,
  Chain,
} from '@/trigger/types';

function buildQuery(
  config: SyncConfig,
  facilitator: Facilitator,
  since: Date,
  now: Date
): string {
  return `
DECLARE facilitator_addresses ARRAY<STRING> DEFAULT [
  "${facilitator.address}"
];
DECLARE usdc_address STRING DEFAULT '${USDC_POLYGON.toLowerCase()}';
DECLARE transfer_topic STRING DEFAULT '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
DECLARE start_ts TIMESTAMP DEFAULT TIMESTAMP('${since.toISOString()}');
DECLARE end_ts TIMESTAMP DEFAULT TIMESTAMP('${now.toISOString()}');

SELECT
  l.address,
  t.from_address AS transaction_from,
  CONCAT('0x', SUBSTRING(l.topics[SAFE_OFFSET(1)], 27)) AS sender,
  CONCAT('0x', SUBSTRING(l.topics[SAFE_OFFSET(2)], 27)) AS recipient,
  SAFE_DIVIDE(CAST(CONCAT('0x', l.data) AS NUMERIC), POW(10, 6)) AS amount,
  l.block_timestamp,
  l.transaction_hash AS tx_hash,
  '${config.chain}' AS chain
FROM \`bigquery-public-data.crypto_polygon.logs\` l
JOIN \`bigquery-public-data.crypto_polygon.transactions\` t
  ON l.transaction_hash = t.hash
  AND l.block_timestamp = t.block_timestamp
WHERE l.block_timestamp >= start_ts
  AND l.block_timestamp < end_ts
  AND l.address = usdc_address
  AND l.topics[SAFE_OFFSET(0)] = transfer_topic
  AND LOWER(t.from_address) IN UNNEST(facilitator_addresses)
ORDER BY l.block_timestamp DESC
LIMIT ${config.limit}`;
}

function transformResponse(
  data: any[],
  config: SyncConfig
): TransferEventData[] {
  return data.map((row: any) => ({
    address: row.address,
    transaction_from: row.transaction_from,
    sender: row.sender,
    recipient: row.recipient,
    amount: Math.round(parseFloat(row.amount) * USDC_MULTIPLIER),
    block_timestamp: new Date(row.block_timestamp.value), // BigQuery returns timestamp objects
    tx_hash: row.tx_hash,
    chain: row.chain,
    provider: config.provider,
    decimals: USDC_DECIMALS,
    facilitator_id: row.facilitator_id,
  }));
}

export const polygonBigQueryConfig: SyncConfig = {
  cron: '*/30 * * * *',
  maxDurationInSeconds: 300,
  chain: 'polygon',
  provider: QueryProvider.BIGQUERY,
  apiUrl: '', // Not used for BigQuery
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowInMs: 7 * 24 * 60 * 60 * 1000, // 1 week
  limit: 20_000,
  facilitators: FACILITATORS.filter(f => f.chain === Chain.POLYGON),
  buildQuery,
  transformResponse,
};
