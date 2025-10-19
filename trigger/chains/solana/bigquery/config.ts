import { 
  ChainSyncConfig, 
  PaginationStrategy, 
  QueryProvider, 
} from "@/trigger/types";
import { buildQuery, transformResponse } from "./query";
import { ONE_DAY_IN_MS, ONE_MINUTE_IN_SECONDS } from "@/trigger/constants";

export const solanaBigQueryConfig: ChainSyncConfig = {
  enabled: true,
  cron: "*/30 * * * *",
  maxDurationInSeconds: ONE_MINUTE_IN_SECONDS * 5,
  chain: "solana",
  provider: QueryProvider.BIGQUERY,
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowInMs: ONE_DAY_IN_MS * 1,
  limit: 20_000,
  facilitators: [
    "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4" // PayAI
  ],
  syncStartDate: new Date('2025-08-01'),
  buildQuery,
  transformResponse,
};