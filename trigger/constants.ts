// solana
export const SOLANA_BITQUERY_API_URL = "https://graphql.bitquery.io";
export const SOLANA_NETWORK = "solana";
export const SOLANA_FACILITATORS = [
    "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4" // PayAI
];
export const SOLANA_SYNC_TASK_ID = "solana-sync-transfers";
export const SOLANA_SYNC_INTERVAL = "*/30 * * * *";
export const SOLANA_SYNC_MAX_DURATION = 300; // in seconds
export const SOLANA_SYNC_FALLBACK_TIME = 6 * 30 * 24 * 60 * 60 * 1000; // in milliseconds

// base
export const BASE_BITQUERY_API_URL = "https://streaming.bitquery.io/graphql";
export const BASE_NETWORK = "base";
export const BASE_FACILITATORS = [
    "0xD8Dfc729cBd05381647EB5540D756f4f8Ad63eec" // Coinbase
];
export const BASE_SYNC_TASK_ID = "base-sync-transfers";
export const BASE_SYNC_INTERVAL = "*/30 * * * *";
export const BASE_SYNC_MAX_DURATION = 1000; // in seconds
export const BASE_SYNC_FALLBACK_TIME = 6 * 30 * 24 * 60 * 60 * 1000; // in milliseconds