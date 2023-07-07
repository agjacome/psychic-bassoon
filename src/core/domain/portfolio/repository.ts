import { type Portfolio, type Address, type PortfolioId } from './types';

export interface PortfolioRepository {
  get(id: PortfolioId): Promise<Portfolio | null>;
  all(): Promise<Portfolio[]>;
  addresses(): Promise<Set<Address>>;
}
