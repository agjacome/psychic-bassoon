import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type DomainEventHandler, type AggregateId, type DomainEvent } from '@core/domain/shared';

export interface EventStore {
  append<E extends DomainEvent>(event: E): Promise<void>;
  find(query: FindQuery): Promise<DomainEvent[]>;
}

export type FindQuery =
  | ReturnType<typeof FindQuery.All>
  | ReturnType<typeof FindQuery.Name>
  | ReturnType<typeof FindQuery.AggregateId>
  | ReturnType<typeof FindQuery.AggregateIdBeforeThan>
  | ReturnType<typeof FindQuery.LaterThan>;

export const FindQuery = {
  All() {
    return { type: 'All' } as const;
  },
  Name(name: string) {
    return { type: 'Name', name } as const;
  },
  AggregateId(aggregateId: AggregateId) {
    return { type: 'AggregateId', aggregateId } as const;
  },
  AggregateIdBeforeThan(aggregateId: AggregateId, timestamp: Date) {
    return { type: 'AggregateIdBeforeThan', aggregateId, timestamp } as const;
  },
  LaterThan(timestamp: Date) {
    return { type: 'LaterThan', timestamp } as const;
  }
};

@sealed
export class EventStoreHandler implements DomainEventHandler<DomainEvent> {
  constructor(private readonly store = ServiceLocator.resolve<EventStore>('EventStore')) {}

  public matches(_event: DomainEvent): _event is DomainEvent {
    return true;
  }

  public async handle(event: DomainEvent): Promise<void> {
    await this.store.append(event);
  }
}
