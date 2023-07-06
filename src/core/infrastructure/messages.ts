import { sealed } from '@shared/decorators';
import {
  type QueryProcessor,
  type Command,
  type CommandDispatcher,
  type CommandHandler,
  type QueryHandler,
  type Query,
  type ResponseOf
} from '@core/application/shared';

@sealed
export class InMemoryQueryProcessor implements QueryProcessor {
  constructor(private readonly handlers: QueryHandler<Query>[]) {}

  public async process<Q extends Query>(query: Q): Promise<ResponseOf<Q>> {
    const handlers = this.handlers.filter(h => h.queryName === query.name);

    if (handlers.length === 0) {
      console.error(`InMemoryQueryProcessor: No handler registered for query ${query.name}`);
    }

    if (handlers.length > 1) {
      console.error(
        `InMemoryQueryProcessor: More than one handler registered for query ${query.name}`
      );
    }

    return (handlers[0] as QueryHandler<Q>).handle(query);
  }
}

@sealed
export class InMemoryCommandBus implements CommandDispatcher {
  constructor(private readonly handlers: CommandHandler<Command>[]) {}

  public async dispatch(command: Command): Promise<void> {
    const handlers = this.handlers.filter(h => h.matches(command));

    if (handlers.length === 0) {
      console.error(`InMemoryCommandBus: No handler registered for command ${command.name}`);
    }

    await Promise.all(handlers.map(h => h.handle(command)));
  }
}
