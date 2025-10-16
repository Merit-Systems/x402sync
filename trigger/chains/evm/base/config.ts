import { createEvmChainConfig } from "../query";

export const baseChainConfig = createEvmChainConfig({
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
  syncStartDate: new Date('2025-04-01'),
});