import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type Address, type Portfolio, type PortfolioId } from '@core/domain/portfolio/types';
import { type PortfolioRepository } from '@core/domain/portfolio/repository';
import { type EventProjection } from '../store/projection';

@sealed
export class EventProjectionPortfolioRepository implements PortfolioRepository {
  constructor(private readonly db = ServiceLocator.resolve<EventProjection>('EventProjection')) {}

  public async get(id: PortfolioId): Promise<Portfolio | null> {
    const portfolios = await this.db.portfolios();
    return portfolios.get(id) ?? null;
  }

  public async all(): Promise<Array<Portfolio>> {
    const portfolios = await this.db.portfolios();
    return Array.from(portfolios.values());
  }

  public addresses(): Promise<Set<Address>> {
    return this.db.addresses();
  }
}
