import { ServiceLocator } from '@shared/utils';
import { type DomainEvent, type AggregateId } from '@core/domain/shared';
import { type PortfolioId } from '@core/domain/portfolio/types';
import { type PortfolioHistory } from '@core/domain/portfolio/service';
import { type EventStore, FindQuery as Q } from '../store/store';

export class StorePortfolioHistory implements PortfolioHistory {
  constructor(private readonly db = ServiceLocator.resolve<EventStore>('EventStore')) {}

  public async get(
    id: PortfolioId
  ): Promise<DomainEvent<string, AggregateId, Record<string, unknown>>[]> {
    return await this.db.find(Q.ByAggregateId(id));
  }
}
