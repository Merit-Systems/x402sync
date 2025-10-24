import { FACILITATORS } from '@/trigger/config';
import { createEvmChainConfig } from '@/trigger/fetch/bitquery/query';
import { Chain } from '@/trigger/types';

export const baseChainConfig = createEvmChainConfig({
  cron: '*/30 * * * *',
  maxDuration: 1000,
  network: 'base',
  chain: 'base',
  facilitators: FACILITATORS.filter(f => f.chain === Chain.BASE),
});
