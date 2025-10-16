import { createChainSyncTask } from "../../sync";
import { baseChainConfig } from "./base/config";

export const baseSyncTransfers = createChainSyncTask(baseChainConfig);
