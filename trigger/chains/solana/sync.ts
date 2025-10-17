import { createChainSyncTask } from "../../sync";
import { solanaChainConfig } from "./config";
import { solanaBigQueryConfig } from "./bigquery";

export const solanaSyncTransfers = createChainSyncTask(solanaChainConfig);


export const solanaBigQuerySyncTransfers = createChainSyncTask(solanaBigQueryConfig);