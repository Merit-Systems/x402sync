import { createManyTransferEvents, getTransferEvents } from '@/db/services';
import { logger, schedules } from '@trigger.dev/sdk/v3';
import { SyncConfig } from './types';
import { fetchTransfers } from './fetch/fetch';

export function createChainSyncTask(config: SyncConfig) {
  return schedules.task({
    id: config.chain + '-sync-transfers-' + config.provider,
    cron: config.cron,
    maxDuration: config.maxDurationInSeconds,
    run: async () => {
      try {
        const now = new Date();

        for (const facilitator of config.facilitators) {
          if (!facilitator.enabled) {
            logger.log(
              `[${config.chain}] Sync is disabled for ${facilitator.id}`
            );
            continue;
          }

          const mostRecentTransfer = await getTransferEvents({
            orderBy: { block_timestamp: 'desc' },
            take: 1,
            where: {
              chain: config.chain,
              transaction_from: facilitator.address,
              provider: config.provider,
            },
          });

          const since =
            mostRecentTransfer[0]?.block_timestamp ?? facilitator.syncStartDate;

          logger.log(
            `[${config.chain}] Syncing ${facilitator.id} from ${since.toISOString()} to ${now.toISOString()}`
          );

          let totalSaved = 0;

          const { totalFetched } = await fetchTransfers(
            config,
            facilitator,
            since,
            now,
            async batch => {
              const syncResult = await createManyTransferEvents(batch);
              totalSaved += syncResult.count;
              logger.log(
                `[${config.chain}] Saved ${syncResult.count} transfers (${batch.length} fetched, ${batch.length - syncResult.count} duplicates)`
              );
            }
          );

          logger.log(
            `[${config.chain}] Completed ${facilitator.id}: ${totalFetched} fetched, ${totalSaved} saved`
          );
        }
      } catch (error) {
        logger.error(`[${config.chain}] Error syncing transfers:`, {
          error: String(error),
        });
        throw error;
      }
    },
  });
}
