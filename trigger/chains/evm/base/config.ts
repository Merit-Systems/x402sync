import { ChainSyncConfig, PaginationStrategy } from "../../../types";
import { buildQuery, transformResponse } from "../query";


export const baseChainConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDuration: 1000,
  network: "base",
  chain: "base",
  facilitators: [
    "0xD8Dfc729cBd05381647EB5540D756f4f8Ad63eec", // x402rs
    "0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6", // coinbase
    "0xc6699d2aada6c36dfea5c248dd70f9cb0235cb63", // payAI
    "0x222c4367a2950f3b53af260e111fc3060b0983ff"  // aurracloud
  ],
  fallbackTime: 6 * 30 * 24 * 60 * 60 * 1000,
  apiUrl: "https://streaming.bitquery.io/graphql",
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  buildQuery,
  transformResponse,
};