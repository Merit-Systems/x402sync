export const BITQUERY_API_URL = "https://graphql.bitquery.io";
export const FACILITATORS = [
    "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4", // PayAI
    "6bAFum3PexAZy6vbdW6nZ88F1aD7T5o7yViB9NdmCYP2",
    "C7ckEzH4varMpBQsaD9bJZSCnWVyk4zAKYA85spuuNbR"
];

export const SYNC_TASK_ID = "sync-transfers";
export const SYNC_INTERVAL = "*/30 * * * *";
export const SYNC_MAX_DURATION = 300; // in seconds
export const SYNC_FALLBACK_TIME = 6 * 30 * 24 * 60 * 60 * 1000; // in milliseconds