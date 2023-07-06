import { type Opaque } from '@shared/types';
import { type AggregateRoot, AggregateId } from '../shared';

export type Address = string;

export type Building = {
  readonly addresses: Set<Address>;
};

export type Asset = {
  readonly name: string;
  readonly buildings: Set<Building>;
};

export type PortfolioId = Opaque<AggregateId, 'PortfolioId'>;

export const PortfolioId = {
  generate: (): PortfolioId => AggregateId.generate() as PortfolioId,
  parse: (id: string): PortfolioId | null => {
    const aggregateId = AggregateId.parse(id);

    if (aggregateId === null) {
      return null;
    }

    return aggregateId as PortfolioId;
  }
};

export type Portfolio = AggregateRoot<PortfolioId> & {
  readonly name: string;
  readonly assets: Set<Asset>;
};
