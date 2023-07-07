import { type DomainEvent } from '../shared';
import { type PortfolioId, type Address } from './types';

export type PortfolioCreated = DomainEvent<'PortfolioCreated', PortfolioId, { name: string }>;

export type AssetCreated = DomainEvent<'AssetCreated', PortfolioId, { name: string }>;

export type BuildingCreated = DomainEvent<
  'BuildingCreated',
  PortfolioId,
  { assetName: string; addresses: Set<Address> }
>;

export type PortfolioRollbacked = DomainEvent<
  'PortfolioRollbacked',
  PortfolioId,
  { timestamp: Date }
>;
