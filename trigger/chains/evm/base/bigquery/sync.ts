import { createChainSyncTask } from "../../../sync";
import { baseChainConfig } from "./bigquery/config";

export const baseSyncTransfers = createChainSyncTask(baseChainConfig);
