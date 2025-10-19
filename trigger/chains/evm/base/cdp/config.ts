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
    {
      id: "coinbase",
      syncStartDate: new Date('2025-05-05'),
      enabled: true,
      address: "0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6"
    },
    {
        id: "payAI",
        syncStartDate: new Date('2025-05-18'),
        enabled: true,
        address: "0xc6699d2aada6c36dfea5c248dd70f9cb0235cb63"
    },
    {
        id: "aurracloud",
        syncStartDate: new Date('2025-10-05'),
        enabled: true,
        address: "0x222c4367a2950f3b53af260e111fc3060b0983ff"
    },
    {
        id: "thirdweb",
        syncStartDate: new Date('2025-10-07'),
        enabled: true,
        address: "0x80c08de1a05df2bd633cf520754e40fde3c794d3"
    }
  ],
  buildQuery,
  transformResponse,
};