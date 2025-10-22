import { SyncConfig, Facilitator, TransferEventData } from "@/trigger/types";
import { USDC_MULTIPLIER, USDC_SOLANA } from "@/trigger/constants";
import { getAccount } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

export function buildQuery(
  config: SyncConfig,
  facilitator: Facilitator,
  since: Date,
  now: Date,
  offset?: number
): string {
    return `
        DECLARE signer_pubkeys ARRAY<STRING> DEFAULT [
        "${facilitator.address}"
        ];
        DECLARE usdc_mint STRING DEFAULT '${USDC_SOLANA}';
        DECLARE start_ts TIMESTAMP DEFAULT TIMESTAMP('${since.toISOString()}');
        DECLARE end_ts TIMESTAMP DEFAULT TIMESTAMP('${now.toISOString()}');

        WITH signer_sigs AS (
        SELECT DISTINCT
            tx.signature,
            (
            SELECT a.pubkey
            FROM UNNEST(tx.accounts) AS a WITH OFFSET AS idx
            WHERE a.signer = TRUE
            ORDER BY idx
            LIMIT 1
            ) AS fee_payer,
            (
            SELECT a.pubkey
            FROM UNNEST(tx.accounts) AS a
            WHERE a.signer = TRUE AND a.pubkey IN UNNEST(signer_pubkeys)
            LIMIT 1
            ) AS matched_signer
        FROM \`robust-catalyst-475116-s4.crypto_solana_mainnet_us.Transactions\` tx
        WHERE tx.block_timestamp >= start_ts AND tx.block_timestamp < end_ts
            AND EXISTS (
            SELECT 1 FROM UNNEST(tx.accounts) a
            WHERE a.signer = TRUE AND a.pubkey IN UNNEST(signer_pubkeys)
            )
        )
        SELECT 
        t.mint AS address, 
        s.fee_payer AS transaction_from,
        t.source AS sender, 
        t.destination AS recipient,
        SAFE_DIVIDE(t.value, POW(10, t.decimals)) AS amount,
        t.block_timestamp, 
        t.tx_signature AS tx_hash,
        COALESCE(
            CASE 
                WHEN i.parent_index IS NOT NULL THEN i.parent_index * 1000 + i.index
                ELSE i.index
            END,
            ROW_NUMBER() OVER (PARTITION BY t.tx_signature ORDER BY t.block_timestamp, t.source, t.destination, t.value) - 1
        ) AS transfer_index,
        '${config.chain}' AS chain
        FROM \`robust-catalyst-475116-s4.crypto_solana_mainnet_us.Token Transfers\` t
        JOIN signer_sigs s ON t.tx_signature = s.signature
        LEFT JOIN \`robust-catalyst-475116-s4.crypto_solana_mainnet_us.Instructions\` i
            ON t.tx_signature = i.tx_signature
            AND t.block_timestamp = i.block_timestamp
            AND i.program = 'spl-token'
            AND i.instruction_type IN ('transfer', 'transferChecked')
        WHERE t.block_timestamp >= start_ts AND t.block_timestamp < end_ts
        AND t.mint = usdc_mint 
        AND t.value IS NOT NULL 
        AND t.decimals IS NOT NULL
        ORDER BY t.block_timestamp DESC
        LIMIT ${config.limit}`;
}

export async function transformResponse(data: any[], config: SyncConfig, facilitator: Facilitator): Promise<TransferEventData[]> {
  const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

  const results = await Promise.all(
    data.map(async (row: any) => {
        const senderTokenAccount = new PublicKey(row.sender);
        const recipientTokenAccount = new PublicKey(row.recipient);

        const [senderAccountInfo, recipientAccountInfo] = await Promise.all([
            getAccount(connection, senderTokenAccount),
            getAccount(connection, recipientTokenAccount),
        ]);

        return {
          address: row.address,
          transaction_from: row.transaction_from,
          sender: senderAccountInfo.owner.toBase58(),
          recipient: recipientAccountInfo.owner.toBase58(),
          amount: Math.round(parseFloat(row.amount) * USDC_MULTIPLIER),
          block_timestamp: new Date(row.block_timestamp.value),
          tx_hash: row.tx_hash,
          chain: row.chain,
          provider: config.provider,
          decimals: facilitator.token.decimals,
          facilitator_id: facilitator.id,
          log_index: row.transfer_index,
        }
    }),
  )

  return results;
}

