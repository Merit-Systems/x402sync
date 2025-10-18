import { createChainSyncTask } from "../../../sync";
import { polygonChainConfig } from "./bitquery/config";

export const polygonSyncTransfers = createChainSyncTask(polygonChainConfig);