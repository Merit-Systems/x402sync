import { createManyTransferEvents, getTransferEvents } from "@/db/services";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { ChainSyncConfig, PaginationStrategy } from "./types";
import { fetchWithOffsetPagination, fetchWithTimeWindowing } from "./fetch";

export function createChainSyncTask(config: ChainSyncConfig) {
  return schedules.task({
    id: config.network + "-sync-transfers",
    cron: config.cron,
    maxDuration: config.maxDuration,
    run: async () => {
      try {
        const now = new Date();
        
        // Get the most recent transfer for this chain
        const mostRecentTransfer = await getTransferEvents({
          orderBy: { block_timestamp: 'desc' },
          take: 1,
          where: {
            chain: config.network
          }
        });

        // Use the most recent transfer's timestamp, or use fallback time
        const since = mostRecentTransfer.length > 0 
          ? mostRecentTransfer[0].block_timestamp 
          : new Date(now.getTime() - config.fallbackTime);

        logger.log(`[${config.network}] Fetching transfers since: ${since.toISOString()} until: ${now.toISOString()}`);

        let allTransfers;

        if (config.paginationStrategy === PaginationStrategy.OFFSET) {
          allTransfers = await fetchWithOffsetPagination(config, since, now);
        } else {
          allTransfers = await fetchWithTimeWindowing(config, since, now);
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

