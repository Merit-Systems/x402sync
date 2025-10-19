import { logger } from "@trigger.dev/sdk/v3";
import { BigQuery } from "@google-cloud/bigquery";
import { ChainSyncConfig } from "../../types";

export async function fetchBigQuery(
  config: ChainSyncConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  const bq = new BigQuery();
  
  logger.log(`[${config.chain}] Fetching BigQuery data from ${since.toISOString()} to ${now.toISOString()}`);
  
  const query = config.buildQuery(config, facilitators, since, now);
  logger.log(`[${config.chain}] BigQuery query for window: ${query.substring(0, 200)}...`);
  
  const [rows] = await bq.query({ query });
  
  logger.log(`[${config.chain}] BigQuery returned ${rows.length} rows`);
  
  return config.transformResponse(rows, config);
}
