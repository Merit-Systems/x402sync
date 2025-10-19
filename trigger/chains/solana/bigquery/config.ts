import { 
  ChainSyncConfig, 
  PaginationStrategy, 
  QueryProvider, 
} from "@/trigger/types";
import { buildQuery, transformResponse } from "./query";
import { ONE_DAY_IN_MS, ONE_MINUTE_IN_SECONDS } from "@/trigger/constants";

export const solanaBigQueryConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDurationInSeconds: ONE_MINUTE_IN_SECONDS * 5,
  chain: "solana",
  provider: QueryProvider.BIGQUERY,
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowInMs: ONE_DAY_IN_MS * 1,
  limit: 20_000,
  facilitators: [
    {
        id: "payAI",
        syncStartDate: new Date('2025-04-01'),
        enabled: true,
        address: "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4"
    }
  ],
  buildQuery,
  transformResponse,
};