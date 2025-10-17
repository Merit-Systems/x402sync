import { PaginationStrategy, QueryConfig, QueryProvider } from "../types";
import { fetchWithBigQuery } from "./bigquery/fetch";
import { fetchWithOffsetPagination, fetchWithTimeWindowing } from "./bitquery/fetch";

export async function fetchTransfers(
    config: QueryConfig,
    facilitators: string[],
    since: Date,
    now: Date
  ): Promise<any[]> {
    if (config.provider === QueryProvider.BIGQUERY) {
      return fetchWithBigQuery(config, facilitators, since, now);
    }

    if (config.provider === QueryProvider.BITQUERY) {
      if (config.paginationStrategy === PaginationStrategy.OFFSET) {
        return fetchWithOffsetPagination(config, facilitators, since, now);
      } 

      if (config.paginationStrategy === PaginationStrategy.TIME_WINDOW) {
        return fetchWithTimeWindowing(config, facilitators, since, now);
      }

      throw new Error(`Unsupported pagination strategy: ${config.paginationStrategy}`);
    }

    throw new Error(`Unsupported provider: ${config.provider}`);
  }
