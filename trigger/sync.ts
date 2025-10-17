import { createManyTransferEvents, getTransferEvents } from "@/db/services";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { ChainSyncConfig } from "./types";
import { fetchTransfers } from "./fetch";

export function createChainSyncTask(config: ChainSyncConfig) {
  return schedules.task({
    id: config.network + "-sync-transfers-" + config.provider,
    cron: config.cron,
    maxDuration: config.maxDuration,
    run: async () => {
      try {
        const now = new Date();
        let allTransfers = [];

        for (const facilitator of config.facilitators) {
          // Get the most recent transfer for this chain and facilitator
          const mostRecentTransfer = await getTransferEvents({
            orderBy: { block_timestamp: 'desc' },
            take: 1,
            where: {
              chain: config.network,
              transaction_from: facilitator
            }
          });

          // Use the most recent transfer's timestamp, or use fallback time
          const since = mostRecentTransfer.length > 0 
            ? mostRecentTransfer[0].block_timestamp 
            : config.syncStartDate;

        logger.log(`[${config.network}] Fetching transfers for ${facilitator} since: ${since.toISOString()} until: ${now.toISOString()}`);

        const transfers = await fetchTransfers(config, [facilitator], since, now);

          logger.log(`[${config.network}] Found ${transfers.length} transfers from ${facilitator}`);
          allTransfers.push(...transfers);
        }

        logger.log(`[${config.network}] Found ${allTransfers.length} total transfers to sync from facilitators`);

        if (allTransfers.length > 0) {
          const syncResult = await createManyTransferEvents(allTransfers);
          logger.log(`[${config.network}] Successfully synced ${syncResult.count} new transfers`);
        }

      } catch (error) {
        logger.error(`[${config.network}] Error syncing transfers:`, { error: String(error) });
        throw error;
      }
    },
  });
}

