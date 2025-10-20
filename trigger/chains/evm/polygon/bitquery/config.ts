import { USDC_DECIMALS, USDC_POLYGON } from "@/trigger/constants";
import { createEvmChainConfig } from "../../../../fetch/bitquery/query";

export const polygonChainConfig = createEvmChainConfig({
  cron: "*/30 * * * *",
  maxDuration: 1000,
  network: "polygon",
  chain: "matic",
  facilitators: [
    {
        id: "coinbase",
        syncStartDate: new Date('2025-04-01'),
        enabled: false,
        address: "0xD8Dfc729cBd05381647EB5540D756f4f8Ad63eec",
        token: {
          address: USDC_POLYGON,
          decimals: USDC_DECIMALS,
          symbol: "USDC",
        }
    }
  ],
});