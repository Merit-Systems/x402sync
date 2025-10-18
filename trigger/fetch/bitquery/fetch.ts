import { logger } from "@trigger.dev/sdk/v3";
import { QueryConfig } from "../../types";
import { PAGE_SIZE } from "../../constants";
import { fetchWithTimeWindowing } from "../fetch";

export async function fetchWithOffsetPagination(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  const allTransfers = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    logger.log(`[${config.chain}] Fetching with offset: ${offset}`);

    const query = config.buildQuery(config, facilitators, since, now, PAGE_SIZE, offset);
    const transfers = await executeBitqueryRequest(config, query);

    allTransfers.push(...transfers);

    if (transfers.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      offset += PAGE_SIZE;
    }

  }
  
  return allTransfers;
}

export async function fetchWithTimeWindowingBitquery(
  config: QueryConfig,
  facilitators: string[],
  since: Date,
  now: Date
): Promise<any[]> {
  const executeQuery = async (query: string) => {
    return executeBitqueryRequest(config, query);
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

async function executeBitqueryRequest(
  config: QueryConfig,
  query: string
): Promise<any[]> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${process.env.BITQUERY_API_KEY}`);

  const rawQuery = JSON.stringify({ query });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: rawQuery,
  };

  const response = await fetch(config.apiUrl, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`[${config.chain}] Bitquery API error (${response.status}):`, { error: errorText });
    throw new Error(`Bitquery API returned ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  if (result.errors) {
    logger.error(`[${config.chain}] Bitquery GraphQL errors:`, { errors: result.errors });
    throw new Error(`Bitquery GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return config.transformResponse(result.data, config.chain);
}
