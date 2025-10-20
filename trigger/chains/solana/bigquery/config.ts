import { 
  SyncConfig, 
  PaginationStrategy, 
  QueryProvider, 
} from "@/trigger/types";
import { buildQuery, transformResponse } from "./query";
import { ONE_DAY_IN_MS, ONE_MINUTE_IN_SECONDS, USDC_SOLANA_TOKEN } from "@/trigger/constants";

export const solanaBigQueryConfig: SyncConfig = {
  cron: "*/30 * * * *",
  maxDurationInSeconds: ONE_MINUTE_IN_SECONDS * 5,
  chain: "solana",
  provider: QueryProvider.BIGQUERY,
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowInMs: ONE_DAY_IN_MS * 30,
  limit: 35_000, // NOTE(shafu): solana could be a lot more!
  facilitators: [
    {
        id: "payAI",
        syncStartDate: new Date('2025-07-01'),
        enabled: true,
        address: "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4",
        token: USDC_SOLANA_TOKEN,
    }
  ],
  buildQuery,
  transformResponse,
};