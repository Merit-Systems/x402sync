import { QueryConfig } from "@/trigger/types";
import { runCdpSqlQuery } from "./helpers";
import { fetchWithTimeWindowing } from "../fetch";
import { PAGE_SIZE } from "@/trigger/constants";

export async function fetchWithTimeWindowingCDP(
    config: QueryConfig,
    facilitators: string[],
    since: Date,
    now: Date
): Promise<any[]> {
    
    const executeQuery = async (query: string) => {
        const rows = await runCdpSqlQuery(query);
        return config.transformResponse(rows, config.chain);
    }

    return fetchWithTimeWindowing(
        config,
        facilitators,
        since,
        now,
        PAGE_SIZE,
        executeQuery
    );
}