import { createChainSyncTask } from "../../sync";
import { polygonChainConfig } from "./polygon/polygon-config";

export const polygonSyncTransfers = createChainSyncTask(polygonChainConfig);