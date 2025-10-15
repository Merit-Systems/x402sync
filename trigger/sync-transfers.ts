import { createManyTransferEvents, getTransferEvents } from "@/db/services";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { ChainSyncConfig } from "./types";

export function createChainSyncTask(config: ChainSyncConfig) {
  return schedules.task({
    id: config.taskId,
    cron: config.cron,
    maxDuration: config.maxDuration,
    run: async () => {
      try {
        const now = new Date();
        
        // Get the most recent transfer for this chain from the database
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

        // Build the GraphQL query using chain-specific builder
        const query = config.buildQuery(since, now, config.facilitators);

        // Prepare Bitquery API request
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${process.env.BITQUERY_API_KEY}`);

        const rawQuery = JSON.stringify({ query });

        const requestOptions = {
          method: "POST",
          headers: headers,
          body: rawQuery,
        };

        // Fetch transfers from Bitquery
        const response = await fetch(config.apiUrl, requestOptions);

        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`[${config.network}] Bitquery API error (${response.status}):`, { error: errorText });
          throw new Error(`Bitquery API returned ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        // Check for GraphQL errors
        if (result.errors) {
          logger.error(`[${config.network}] Bitquery GraphQL errors:`, { errors: result.errors });
          throw new Error(`Bitquery GraphQL errors: ${JSON.stringify(result.errors)}`);
        }

        // Transform the response using chain-specific transformer
        const transfers = config.transformResponse(result.data);

        logger.log(`[${config.network}] Found ${transfers.length} transfers to sync from facilitators`);

        // Save new transfers to database
        if (transfers.length > 0) {
          const syncResult = await createManyTransferEvents(transfers);
          logger.log(`[${config.network}] Successfully synced ${syncResult.count} new transfers`);
        }

      } catch (error) {
        logger.error(`[${config.network}] Error syncing transfers:`, { error: String(error) });
        throw error;
      }
    },
  });
}
