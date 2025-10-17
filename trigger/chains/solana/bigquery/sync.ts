import { createChainSyncTask } from "../../../sync";
import { solanaBigQueryConfig } from "../bigquery";

export const solanaBigQuerySyncTransfers = createChainSyncTask(solanaBigQueryConfig);