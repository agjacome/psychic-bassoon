// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Query<Name extends string = string, Arguments = unknown, _Response = unknown> {
  readonly name: Name;
  readonly arguments: Arguments;
}

export type ResponseOf<Q extends Query> = Q extends Query<string, unknown, infer R> ? R : never;

export interface QueryHandler<Q extends Query> {
  queryName: Q['name'];
  handle(query: Q): Promise<ResponseOf<Q>>;
}

export interface QueryProcessor {
  process<Q extends Query>(query: Q): Promise<ResponseOf<Q>>;
}

export interface Command<Name extends string = string, Arguments = unknown> {
  readonly name: Name;
  readonly arguments: Arguments;
}

export interface CommandHandler<C extends Command> {
  matches(command: Command): command is C;
  handle(command: C): Promise<void>;
}

export interface CommandDispatcher {
  dispatch<C extends Command>(command: C): Promise<void>;
}
