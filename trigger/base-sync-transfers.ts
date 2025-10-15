import { createChainSyncTask } from "./sync-transfers";
import { baseChainConfig } from "./chains/base";

export const baseSyncTransfers = createChainSyncTask(baseChainConfig);
