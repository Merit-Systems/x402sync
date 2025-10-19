import { createEvmChainConfig } from "@/trigger/fetch/bitquery/query";

export const baseChainConfig = createEvmChainConfig({
  cron: "*/30 * * * *",
  maxDuration: 1000,
  network: "base",
  chain: "base",
  facilitators: [
    {
      id: "coinbase",
      syncStartDate: new Date('2025-04-01'),
      enabled: true,
      address: "0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6"
    },
    {
        id: "payAI",
        syncStartDate: new Date('2025-05-19'),
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
        syncStartDate: new Date('2025-10-15'),
        enabled: true,
        address: "0x80c08de1a05df2bd633cf520754e40fde3c794d3"
    }
  ],
});