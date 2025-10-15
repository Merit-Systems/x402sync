import { createChainSyncTask } from "./sync-transfers";
import { solanaChainConfig } from "./chains/solana";

export const solanaSyncTransfers = createChainSyncTask(solanaChainConfig);
