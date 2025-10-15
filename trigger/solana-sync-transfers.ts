import { createManyTransferEvents, getTransferEvents } from "@/db/services";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { SOLANA_BITQUERY_API_URL, SOLANA_FACILITATORS, SOLANA_NETWORK, SOLANA_SYNC_FALLBACK_TIME, SOLANA_SYNC_INTERVAL, SOLANA_SYNC_MAX_DURATION, SOLANA_SYNC_TASK_ID } from "./constants";

export const solanaSyncTransfers = schedules.task({
  id: SOLANA_SYNC_TASK_ID,
  cron: SOLANA_SYNC_INTERVAL,
  maxDuration: SOLANA_SYNC_MAX_DURATION,
  run: async () => {
    try {
      const now = new Date();
      
      const mostRecentTransfer = await getTransferEvents({
        orderBy: { block_timestamp: 'desc' },
        take: 1,
        where: {
          chain: SOLANA_NETWORK
        }
      });

      // Use the most recent transfer's timestamp, or use fallback time
      const since = mostRecentTransfer.length > 0 
        ? mostRecentTransfer[0].block_timestamp 
        : new Date(now.getTime() - SOLANA_SYNC_FALLBACK_TIME);

      logger.log(`Fetching transfers since: ${since.toISOString()} until: ${now.toISOString()}`);

      // Fetch transfers from Bitquery
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${process.env.BITQUERY_API_KEY}`);

      const rawQuery = JSON.stringify({
        query: `
          {
            solana(network: solana) {
              sent: transfers(
                options: {desc: "block.height", limit: 20000, offset: 0}
                time: {
                  since: "${since.toISOString()}"
                  till: "${now.toISOString()}"
                }
                amount: {gt: 0}
                signer: {
                  in: ${JSON.stringify(SOLANA_FACILITATORS)}
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
        `
      });

      const requestOptions = {
        method: "POST",
        headers: headers,
        body: rawQuery,
      };

      const response = await fetch(SOLANA_BITQUERY_API_URL, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Bitquery API error (${response.status}):`, { error: errorText });
        throw new Error(`Bitquery API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      // Parse and transform the transfers
      const transfers = result.data.solana.sent.map((transfer: any) => ({
        address: transfer.currency.address,
        transaction_from: transfer.transaction.feePayer,
        sender: transfer.sender.address,
        recipient: transfer.receiver.address,
        amount: parseFloat(transfer.amount),
        block_timestamp: new Date(transfer.block.timestamp.time),
        tx_hash: transfer.transaction.signature,
        chain: "solana",
      }));

      logger.log(`Found ${transfers.length} transfers to sync from facilitators`);

      if (transfers.length > 0) {
        const result = await createManyTransferEvents(transfers);
        logger.log(`Successfully synced ${result.count} new transfers`);
      }

    } catch (error) {
      logger.error("Error syncing transfers:", { error: String(error) });
      throw error;
    }
  },
});
