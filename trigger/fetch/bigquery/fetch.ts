import { logger } from "@trigger.dev/sdk/v3";
import { BigQuery } from "@google-cloud/bigquery";
import { QueryConfig } from "../../types";

export async function fetchWithBigQuery(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  const bq = new BigQuery();

  const allTransfers = [];
  
  // BigQuery queries can handle all facilitators in one query,
  // but current architecture fetches per facilitator
  for (const facilitator of facilitators) {
    logger.log(`[${config.chain}] Fetching BigQuery data for facilitator: ${facilitator}`);
    
    const query = config.buildQuery(config, [facilitator], since, now, 1000);

    logger.log(`[${config.chain}] BigQuery query: ${query}`);
    
    const [rows] = await bq.query({
      query,
    });
    
    logger.log(`[${config.chain}] BigQuery returned ${rows.length} rows`);
    
    allTransfers.push(...config.transformResponse(rows, config.chain));
  }
  
  return allTransfers;
}
