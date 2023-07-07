import { PrismaClient } from '@prisma/client';

import { ServiceLocator } from '@shared/utils';
import { type DomainEvent, type DomainEventHandler } from '@core/domain/shared';
import { PortfolioService } from '@core/domain/portfolio/service';
import {
  type Query,
  type QueryHandler,
  type Command,
  type CommandHandler
} from '@core/application/shared';
import {
  CreateAssetHandler,
  CreateBuildingHandler,
  CreatePortfolioHandler,
  RollbackPortfolioHandler
} from '@core/application/portfolio/commands';
import {
  GetAllPortfoliosHandler,
  GetPortfolioHandler,
  GetPortfolioHistoryHandler
} from '@core/application/portfolio/queries';
import { getEnvStr } from './config';
import { InMemoryDomainEventBus } from './events';
import { InMemoryCommandBus, InMemoryQueryProcessor } from './messages';
import { EventStoreHandler } from './store/store';
import { PrismaEventStore } from './store/prismaStore';
import { EventProjectionHandler, type EventProjection } from './store/projection';
import { JsonMappedEventProjection } from './store/jsonProjection';
import { EventProjectionPortfolioRepository } from './portfolio/repository';
import { StorePortfolioHistory } from './portfolio/service';

export const CoreConfig = Object.freeze({
  READ_PROJECTION_FILE: getEnvStr('READ_PROJECTION_FILE', 'event-store.json')
});

export async function bootstrap(): Promise<void> {
  const factories: Record<string, () => unknown> = {
    PrismaClient: () => {
      return new PrismaClient();
    },
    EventStore: () => {
      return new PrismaEventStore();
    },
    EventProjection: () => {
      return new JsonMappedEventProjection(CoreConfig.READ_PROJECTION_FILE);
    },
    PortfolioRepository: () => {
      return new EventProjectionPortfolioRepository();
    },
    PortfolioHistory: () => {
      return new StorePortfolioHistory();
    },
    PortfolioService: () => {
      return new PortfolioService();
    },
    DomainEventDispatcher: () => {
      return new InMemoryDomainEventBus([
        new EventStoreHandler() as DomainEventHandler<DomainEvent>,
        new EventProjectionHandler() as DomainEventHandler<DomainEvent>
      ]);
    },
    QueryProcessor: () => {
      return new InMemoryQueryProcessor([
        new GetPortfolioHandler() as QueryHandler<Query>,
        new GetAllPortfoliosHandler() as QueryHandler<Query>,
        new GetPortfolioHistoryHandler() as QueryHandler<Query>
      ]);
    },
    CommandDispatcher: () => {
      return new InMemoryCommandBus([
        new CreatePortfolioHandler() as CommandHandler<Command>,
        new CreateAssetHandler() as CommandHandler<Command>,
        new CreateBuildingHandler() as CommandHandler<Command>,
        new RollbackPortfolioHandler() as CommandHandler<Command>
      ]);
    }
  };

  Object.entries(factories).forEach(([name, factory]) => {
    ServiceLocator.register(name, factory);
  });

  await initialize();
}

async function initialize(): Promise<void> {
  const projection = ServiceLocator.resolve<EventProjection>('EventProjection');

  await projection.initialize();
}
