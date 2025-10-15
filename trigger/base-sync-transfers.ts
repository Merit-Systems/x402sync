import { createManyTransferEvents, getTransferEvents } from "@/db/services";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { BASE_FACILITATORS, BASE_NETWORK, BASE_SYNC_FALLBACK_TIME, BASE_SYNC_INTERVAL, BASE_SYNC_MAX_DURATION, BASE_SYNC_TASK_ID, BASE_BITQUERY_API_URL } from "./constants";

export const baseSyncTransfers = schedules.task({
  id: BASE_SYNC_TASK_ID,
  cron: BASE_SYNC_INTERVAL,
  maxDuration: BASE_SYNC_MAX_DURATION,
  run: async () => {
    try {
      const now = new Date();
      
      const mostRecentTransfer = await getTransferEvents({
        orderBy: { block_timestamp: 'desc' },
        take: 1,
        where: {
          chain: BASE_NETWORK
        }
      });

      // Use the most recent transfer's timestamp, or use fallback time
      const since = mostRecentTransfer.length > 0 
        ? mostRecentTransfer[0].block_timestamp 
        : new Date(now.getTime() - BASE_SYNC_FALLBACK_TIME);

      logger.log(`Fetching transfers since: ${since.toISOString()} until: ${now.toISOString()}`);

      // Fetch transfers from Bitquery
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${process.env.BITQUERY_API_KEY}`);

      const rawQuery = JSON.stringify({
        query: `
          {
            EVM(network: base, dataset: combined) {
              Transfers(
                where: {
                  Transaction: {
                    From: {in: ${JSON.stringify(BASE_FACILITATORS)}}
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
                  Date
                  Number
                }
                Transaction {
                  Hash
                  From
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

      const response = await fetch(BASE_BITQUERY_API_URL, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Bitquery API error (${response.status}):`, { error: errorText });
        throw new Error(`Bitquery API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      console.log("result", result);

      // Parse and transform the transfers
      const transfers = result.data.EVM.Transfers.map((item: any) => ({
        address: item.Transfer.Currency?.SmartContract || "0x0000000000000000000000000000000000000000",
        transaction_from: item.Transaction.From,
        sender: item.Transfer.Sender,
        recipient: item.Transfer.Receiver,
        amount: parseFloat(item.Transfer.Amount),
        block_timestamp: new Date(item.Block.Date),
        tx_hash: item.Transaction.Hash,
        chain: "base",
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

