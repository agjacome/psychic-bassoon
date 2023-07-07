import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type DomainEventHandler, type AggregateId, type DomainEvent } from '@core/domain/shared';

export interface EventStore {
  append<E extends DomainEvent>(event: E): Promise<void>;
  find(query: FindQuery): Promise<DomainEvent[]>;
}

export type FindQuery =
  | ReturnType<typeof FindQuery.All>
  | ReturnType<typeof FindQuery.ByName>
  | ReturnType<typeof FindQuery.ByAggregateId>
  | ReturnType<typeof FindQuery.ByAggregateIdBeforeThan>
  | ReturnType<typeof FindQuery.ByLaterThan>;

export const FindQuery = {
  All() {
    return { type: 'All' } as const;
  },
  ByName(name: string) {
    return { type: 'Name', name } as const;
  },
  ByAggregateId(aggregateId: AggregateId) {
    return { type: 'AggregateId', aggregateId } as const;
  },
  ByAggregateIdBeforeThan(aggregateId: AggregateId, timestamp: Date) {
    return { type: 'AggregateIdBeforeThan', aggregateId, timestamp } as const;
  },
  ByLaterThan(timestamp: Date) {
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
