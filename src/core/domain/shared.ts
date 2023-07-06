import crypto from 'crypto';
import proquint from 'proquint-';

import { type Opaque } from '@shared/types';

export type AggregateId = Opaque<string, 'AggregateId'>;

export const AggregateId = {
  generate: (): AggregateId => {
    const buffer = crypto.randomBytes(4);
    return proquint.encode(buffer) as AggregateId;
  },
  validate: (id: string): boolean => {
    return proquint.decode(id).byteLength === 4;
  },
  parse: (id: string): AggregateId | null => {
    return AggregateId.validate(id) ? (id as AggregateId) : null;
  }
};

export interface AggregateRoot<Id extends AggregateId = AggregateId> {
  readonly id: Id;
}

export interface DomainEvent<
  Name extends string = string,
  EntityId extends AggregateId = AggregateId,
  Payload = unknown
> {
  readonly name: Name;
  readonly aggregateId: EntityId;
  readonly timestamp: Date;
  readonly payload: Payload;
}

export interface DomainEventDispatcher {
  dispatch<E extends DomainEvent>(event: E): Promise<void>;
}

export interface DomainEventHandler<E extends DomainEvent> {
  matches(event: DomainEvent): event is E;
  handle(event: E): Promise<void>;
}

export abstract class DomainException extends Error {
  constructor(public readonly code: string, public readonly message: string) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
