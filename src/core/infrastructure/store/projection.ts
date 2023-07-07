import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type DomainEventHandler, type DomainEvent } from '@core/domain/shared';
import { type Address, type Portfolio, type PortfolioId } from '@core/domain/portfolio/types';

export interface EventProjection {
  initialize(): Promise<void>;
  replay(): Promise<void>;
  apply(event: DomainEvent): Promise<void>;

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
