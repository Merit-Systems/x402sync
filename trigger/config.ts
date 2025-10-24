import {
  USDC_BASE_TOKEN,
  USDC_DECIMALS,
  USDC_POLYGON,
  USDC_SOLANA_TOKEN,
} from './constants';
import { Chain, Facilitator } from './types';
import { validateUniqueFacilitators } from './validate';

const _FACILITATORS = validateUniqueFacilitators([
  {
    id: 'coinbase',
    enabled: true,
    syncStartDate: new Date('2025-05-05'),
    address: '0xdbdf3d8ed80f84c35d01c6c9f9271761bad90ba6',
    token: USDC_BASE_TOKEN,
    chain: Chain.BASE,
  },
  {
    id: 'payAI',
    enabled: true,
    syncStartDate: new Date('2025-05-18'),
    address: '0xc6699d2aada6c36dfea5c248dd70f9cb0235cb63',
    token: USDC_BASE_TOKEN,
    chain: Chain.BASE,
  },
  {
    id: 'x402rs',
    enabled: true,
    syncStartDate: new Date('2024-12-05'),
    address: '0xd8dfc729cbd05381647eb5540d756f4f8ad63eec',
    token: USDC_BASE_TOKEN,
    chain: Chain.BASE,
  },
  {
    id: 'aurracloud',
    enabled: true,
    syncStartDate: new Date('2025-10-05'),
    address: '0x222c4367a2950f3b53af260e111fc3060b0983ff',
    token: USDC_BASE_TOKEN,
    chain: Chain.BASE,
  },
  {
    id: 'thirdweb',
    enabled: true,
    syncStartDate: new Date('2025-10-07'),
    address: '0x80c08de1a05df2bd633cf520754e40fde3c794d3',
    token: USDC_BASE_TOKEN,
    chain: Chain.BASE,
  },
  {
    id: 'x402rs',
    enabled: false,
    syncStartDate: new Date('2025-04-01'),
    address: '0xd8dfc729cbd05381647eb5540d756f4f8ad63eec',
    token: {
      address: USDC_POLYGON,
      decimals: USDC_DECIMALS,
      symbol: 'USDC',
    },
    chain: Chain.POLYGON,
  },
  {
    id: 'payAI',
    syncStartDate: new Date('2025-07-01'),
    enabled: true,
    address: '2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4',
    token: USDC_SOLANA_TOKEN,
    chain: Chain.SOLANA,
  },
  {
    id: 'corbits',
    syncStartDate: new Date('2025-9-21'),
    enabled: true,
    address: 'AepWpq3GQwL8CeKMtZyKtKPa7W91Coygh3ropAJapVdU',
    token: USDC_SOLANA_TOKEN,
    chain: Chain.SOLANA,
  },
] as const);

export const FACILITATORS: Facilitator[] =
  _FACILITATORS as unknown as Facilitator[];
