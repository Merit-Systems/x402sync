import { ONE_DAY_IN_MS, ONE_MINUTE_IN_SECONDS } from "@/trigger/constants";
import {
  ChainSyncConfig,
  PaginationStrategy,
  QueryProvider,
} from "@/trigger/types";
import { buildQuery, transformResponse } from "./query";

export const baseCdpConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDurationInSeconds: ONE_MINUTE_IN_SECONDS * 10,
  chain: "base",
  provider: QueryProvider.CDP,
  apiUrl: "api.cdp.coinbase.com",
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowInMs: ONE_DAY_IN_MS * 7,
  limit: 20_000,
  facilitators: [
    "0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6",
  ],
  syncStartDate: new Date('2025-10-17'),
  buildQuery,
  transformResponse,
};