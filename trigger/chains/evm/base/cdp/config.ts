import { ONE_DAY_IN_MS, ONE_MINUTE_IN_SECONDS, USDC_BASE_TOKEN } from "@/trigger/constants";
import {
  SyncConfig,
  PaginationStrategy,
  QueryProvider,
  Chain,
} from "@/trigger/types";
import { buildQuery, transformResponse } from "./query";
import { FACILITATORS } from "@/trigger/config";

export const baseCdpConfig: SyncConfig = {
  cron: "*/1 * * * *",
  maxDurationInSeconds: ONE_MINUTE_IN_SECONDS * 10,
  chain: "base",
  provider: QueryProvider.CDP,
  apiUrl: "api.cdp.coinbase.com",
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowInMs: ONE_DAY_IN_MS * 7,
  limit: 40_000, // NOTE(shafu): 20_000 is not enough
  facilitators: FACILITATORS.filter(f => f.chain === Chain.BASE),
  buildQuery,
  transformResponse,
};
