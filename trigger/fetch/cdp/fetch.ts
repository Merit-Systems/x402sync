import { ChainSyncConfig } from "@/trigger/types";
import { runCdpSqlQuery } from "./helpers";
import { fetchWithTimeWindowing } from "../fetch";

export async function fetchWithTimeWindowingCDP(
    config: ChainSyncConfig,
    facilitators: string[],
    since: Date,
    now: Date
): Promise<any[]> {
    
    const executeQuery = async (query: string) => {
        const rows = await runCdpSqlQuery(query);
        return config.transformResponse(rows, config);
    }

    return fetchWithTimeWindowing(
        config,
        facilitators,
        since,
        now,
        executeQuery
    );
}