import { SyncConfig, Facilitator, TransferEventData } from '@/trigger/types';
import { runCdpSqlQuery } from './helpers';
import { logger } from '@trigger.dev/sdk/v3';

export async function fetchCDP(
  config: SyncConfig,
  facilitator: Facilitator,
  since: Date,
  now: Date
): Promise<TransferEventData[]> {
  logger.log(
    `[${config.chain}] Fetching CDP data from ${since.toISOString()} to ${now.toISOString()}`
  );

  const query = config.buildQuery(config, facilitator, since, now);
  const rows = await runCdpSqlQuery(query);

  return config.transformResponse(rows, config, facilitator);
}
