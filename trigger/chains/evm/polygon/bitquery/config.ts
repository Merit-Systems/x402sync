import { createEvmChainConfig } from "../../../../fetch/bitquery/query";

export const polygonChainConfig = createEvmChainConfig({
  cron: "*/30 * * * *",
  maxDuration: 1000,
  network: "polygon",
  chain: "matic",
  facilitators: [
    "0xD8Dfc729cBd05381647EB5540D756f4f8Ad63eec" // Coinbase
  ],
  syncStartDate: new Date('2025-08-01'),
});