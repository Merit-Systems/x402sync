import { ChainSyncConfig } from "@/trigger/types";
import { runCdpSqlQuery } from "./helpers";
import { logger } from "@trigger.dev/sdk/v3";

export async function fetchCDP(
  config: ChainSyncConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  logger.log(`[${config.chain}] Fetching CDP data from ${since.toISOString()} to ${now.toISOString()}`);
  
  const query = config.buildQuery(config, facilitators, since, now);
  const rows = await runCdpSqlQuery(query);
  
  return config.transformResponse(rows, config);
}