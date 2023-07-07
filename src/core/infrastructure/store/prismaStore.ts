import crypto from 'crypto';
import superjson from 'superjson';
import { type PrismaClient, type Event as PrismaEvent } from '@prisma/client';

import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { AggregateId, type DomainEvent } from '@core/domain/shared';
import { type FindQuery, type EventStore } from './store';

@sealed
export class PrismaEventStore implements EventStore {
  private readonly events: PrismaClient['event'];

  constructor(prisma = ServiceLocator.resolve<PrismaClient>('PrismaClient')) {
    this.events = prisma.event;
  }

  public async append<E extends DomainEvent>(event: E): Promise<void> {
    const data: PrismaEvent = {
      id: crypto.randomUUID(),
      name: event.name,
      aggregateId: event.aggregateId,
      timestamp: event.timestamp,
      payload: superjson.stringify(event.payload)
    };

    await this.events.create({ data });
  }

  public async find(query: FindQuery): Promise<DomainEvent[]> {
    const where = () => {
      switch (query.type) {
        case 'All':
          return {};
        case 'Name':
          return { name: query.name };
        case 'AggregateId':
          return { aggregateId: query.aggregateId };
        case 'AggregateIdBeforeThan':
          return {
            aggregateId: query.aggregateId,
            timestamp: { lte: query.timestamp }
          };
        case 'LaterThan':
          return { timestamp: { gte: query.timestamp } };
      }
    };

    const events = await this.events.findMany({
      where: where(),
      orderBy: { timestamp: 'asc' }
    });

    return events.map(event => {
      return {
        name: event.name,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        aggregateId: AggregateId.parse(event.aggregateId)!,
        timestamp: event.timestamp,
        payload: superjson.parse(event.payload)
      };
    });
  }
}
