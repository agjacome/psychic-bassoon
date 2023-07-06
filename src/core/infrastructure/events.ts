import { sealed } from '@shared/decorators';
import {
  type DomainEvent,
  type DomainEventDispatcher,
  type DomainEventHandler
} from '@core/domain/shared';

@sealed
export class InMemoryDomainEventBus implements DomainEventDispatcher {
  constructor(private readonly handlers: DomainEventHandler<DomainEvent>[]) {}

  public async dispatch(event: DomainEvent): Promise<void> {
    const matching = this.handlers.filter(h => h.matches(event));

    if (matching.length === 0) {
      console.warn(`No DomainEventHandler registered for event ${event.name}`);
    }

    await Promise.all(matching.map(h => h.handle(event)));
  }
}
