import { ChainSyncConfig, PaginationStrategy } from "../../../types";
import { transformResponse } from "../query";
import { buildQuery } from "../query";

export const polygonChainConfig: ChainSyncConfig = {
  cron: "*/30 * * * *",
  maxDuration: 1000,
  network: "polygon",
  chain: "matic",
  facilitators: [
    "0xD8Dfc729cBd05381647EB5540D756f4f8Ad63eec" // Coinbase
  ],
  fallbackTime: 6 * 30 * 24 * 60 * 60 * 1000,
  apiUrl: "https://streaming.bitquery.io/graphql",
  paginationStrategy: PaginationStrategy.TIME_WINDOW,
  buildQuery,
  transformResponse,
};