import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type DomainEventHandler, type DomainEvent } from '@core/domain/shared';
import { type Address, type Portfolio, type PortfolioId } from '@core/domain/portfolio/types';
import { type EventStore } from './store';

export interface EventProjection {
  apply(event: DomainEvent): Promise<void>;
  applyAll(eventStore: EventStore): Promise<void>;
  replay(event: EventStore): Promise<void>;

  portfolios(): Promise<Map<PortfolioId, Portfolio>>;
  addresses(): Promise<Set<Address>>;
}

@sealed
export class EventProjectionHandler implements DomainEventHandler<DomainEvent> {
  constructor(
    private readonly projection: EventProjection = ServiceLocator.resolve<EventProjection>(
      'EventProjection'
    )
  ) {}

  public matches(_event: DomainEvent): _event is DomainEvent {
    return true;
  }

  public async handle(event: DomainEvent): Promise<void> {
    await this.projection.apply(event);
  }
}
