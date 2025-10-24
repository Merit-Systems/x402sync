import { createEvmChainConfig } from "../../../../fetch/bitquery/query";
import { Chain } from "@/trigger/types";
import { FACILITATORS } from "@/trigger/config";

export const polygonChainConfig = createEvmChainConfig({
  cron: "*/30 * * * *",
  maxDuration: 1000,
  network: "polygon",
  chain: "matic",
  facilitators: FACILITATORS.filter(f => f.chain === Chain.POLYGON),
});