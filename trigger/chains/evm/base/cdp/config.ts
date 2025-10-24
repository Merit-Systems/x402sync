import { ONE_DAY_IN_MS, ONE_MINUTE_IN_SECONDS, USDC_BASE_TOKEN } from "@/trigger/constants";
import {
  SyncConfig,
  PaginationStrategy,
  QueryProvider,
} from "@/trigger/types";
import { buildQuery, transformResponse } from "./query";

export const baseCdpConfig: SyncConfig = {
  cron: "*/1 * * * *",
  maxDurationInSeconds: ONE_MINUTE_IN_SECONDS * 10,
  chain: "base",
  provider: QueryProvider.CDP,
  apiUrl: "api.cdp.coinbase.com",
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  timeWindowInMs: ONE_DAY_IN_MS * 7,
  limit: 40_000, // NOTE(shafu): 20_000 is not enough
  facilitators: [
    {
        id: "coinbase",
        enabled: true,
        syncStartDate: new Date('2025-05-05'),
        address: "0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6",
        token: USDC_BASE_TOKEN,
    },
    {
        id: "payAI",
        enabled: true,
        syncStartDate: new Date('2025-05-18'),
        address: "0xc6699d2aada6c36dfea5c248dd70f9cb0235cb63",
        token: USDC_BASE_TOKEN,
    },
    {
        id: "x402rs",
        enabled: true,
        syncStartDate: new Date('2024-12-05'),
        address: "0xd8dfc729cbd05381647eb5540d756f4f8ad63eec",
        token: USDC_BASE_TOKEN,
    },
    {
        id: "aurracloud",
        enabled: true,
        syncStartDate: new Date('2025-10-05'),
        address: "0x222c4367a2950f3b53af260e111fc3060b0983ff",
        token: USDC_BASE_TOKEN,
    },
    {
        id: "thirdweb",
        enabled: true,
        syncStartDate: new Date('2025-10-07'),
        address: "0x80c08de1a05df2bd633cf520754e40fde3c794d3",
        token: USDC_BASE_TOKEN,
    }
  ],
  buildQuery,
  transformResponse,
};
