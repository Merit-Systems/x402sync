import { logger } from "@trigger.dev/sdk/v3";
import { BigQuery } from "@google-cloud/bigquery";
import { QueryConfig } from "../../types";
import { fetchWithTimeWindowing } from "../fetch";
import { PAGE_SIZE } from "@/trigger/constants";


export async function fetchWithTimeWindowingBigQuery(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  const bq = new BigQuery();
  
  logger.log(`[${config.chain}] Fetching BigQuery data for ${facilitators.length} facilitator(s)`);
  
  const executeQuery = async (query: string) => {
    logger.log(`[${config.chain}] BigQuery query for window: ${query}`);
    
    const [rows] = await bq.query({ query });
    
    logger.log(`[${config.chain}] BigQuery returned ${rows.length} rows`);
    
    return config.transformResponse(rows, config.chain);
  };

  return fetchWithTimeWindowing(
    config,
    facilitators,
    since,
    now,
    PAGE_SIZE,
    executeQuery
  );
}
