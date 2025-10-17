import { USDC_MULTIPLIER, USDC_SOLANA } from "@/trigger/constants";
import { 
  ChainSyncConfig, 
  PaginationStrategy, 
  QueryConfig, 
  QueryProvider, 
  TransferEventData 
} from "@/trigger/types";


function buildQuery(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date,
  limit: number,
  offset?: number
): string {
  const signerPubkey = facilitators[0]; // Handle one facilitator at a time

  return `
DECLARE signer_pubkey STRING DEFAULT '${signerPubkey}';
DECLARE usdc_mint STRING DEFAULT '${USDC_SOLANA}';
DECLARE start_ts TIMESTAMP DEFAULT TIMESTAMP('${since.toISOString()}');
DECLARE end_ts TIMESTAMP DEFAULT TIMESTAMP('${now.toISOString()}');

WITH signer_sigs AS (
  SELECT tx.signature,
    (SELECT a.pubkey FROM UNNEST(tx.accounts) a WITH OFFSET AS idx
     WHERE a.signer = TRUE ORDER BY idx LIMIT 1) AS fee_payer
  FROM \`robust-catalyst-475116-s4.crypto_solana_mainnet_us.Transactions\` tx
  WHERE tx.block_timestamp >= start_ts AND tx.block_timestamp < end_ts
    AND EXISTS (SELECT 1 FROM UNNEST(tx.accounts) a
                WHERE a.signer = TRUE AND a.pubkey = signer_pubkey)
)
SELECT 
  t.mint AS address, 
  s.fee_payer AS transaction_from,
  t.source AS sender, 
  t.destination AS recipient,
  SAFE_DIVIDE(t.value, POW(10, t.decimals)) AS amount,
  t.block_timestamp, 
  t.tx_signature AS tx_hash, 
  '${config.network}' AS chain
FROM \`robust-catalyst-475116-s4.crypto_solana_mainnet_us.Token Transfers\` t
JOIN signer_sigs s ON t.tx_signature = s.signature
WHERE t.block_timestamp >= start_ts AND t.block_timestamp < end_ts
  AND t.mint = usdc_mint 
  AND t.value IS NOT NULL 
  AND t.decimals IS NOT NULL
ORDER BY t.block_timestamp DESC
LIMIT ${limit}`;
}

function transformResponse(data: any[], network: string): TransferEventData[] {
  return data.map((row: any) => ({
    address: row.address,
    transaction_from: row.transaction_from,
    sender: row.sender,
    recipient: row.recipient,
    amount: Math.round(parseFloat(row.amount) * USDC_MULTIPLIER),
    block_timestamp: new Date(row.block_timestamp.value), // BigQuery returns timestamp objects
    tx_hash: row.tx_hash,
    chain: row.chain,
  }));
}

export const solanaBigQueryConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDuration: 300,
  network: "solana-bigquery",
  chain: "solana",
  provider: QueryProvider.BIGQUERY,
  apiUrl: "", // Not used for BigQuery
  facilitators: [
    "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4" // PayAI
  ],
  syncStartDate: new Date('2025-04-01'),
  paginationStrategy: PaginationStrategy.BIGQUERY,
  buildQuery,
  transformResponse,
};