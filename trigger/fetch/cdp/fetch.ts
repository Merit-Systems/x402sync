import { ChainSyncConfig, FacilitatorConfig } from "@/trigger/types";
import { runCdpSqlQuery } from "./helpers";
import { logger } from "@trigger.dev/sdk/v3";

export async function fetchCDP(
  config: ChainSyncConfig,
  facilitator: FacilitatorConfig,
  since: Date,
  now: Date
): Promise<any[]> {
  logger.log(`[${config.chain}] Fetching CDP data from ${since.toISOString()} to ${now.toISOString()}`);
  
  const query = config.buildQuery(config, facilitator, since, now);
  const rows = await runCdpSqlQuery(query);
  
  return config.transformResponse(rows, config, facilitator);
}