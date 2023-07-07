import fs from 'fs';
import superjson from 'superjson';

import { sealed } from '@shared/decorators';
import { type DomainEvent } from '@core/domain/shared';
import { type PortfolioId, type Portfolio, type Address } from '@core/domain/portfolio/types';
import {
  type PortfolioCreated,
  type AssetCreated,
  type BuildingCreated,
  type PortfolioRollbacked
} from '@core/domain/portfolio/events';
import { type EventProjection } from './projection';
import { FindQuery as Q, type EventStore } from './store';
import { ServiceLocator } from '@shared/utils';

type State = {
  lastTimestamp: Date;
  portfolios: Map<PortfolioId, Portfolio>;
  addresses: Set<Address>;
};

@sealed
export class JsonMappedEventProjection implements EventProjection {
  private readonly state: State = {
    lastTimestamp: new Date(0),
    portfolios: new Map<PortfolioId, Portfolio>(),
    addresses: new Set<Address>()
  };

  constructor(
    filePath: string,
    private readonly store: EventStore = ServiceLocator.resolve<EventStore>('EventStore')
  ) {
    this.load(filePath);

    const saveIntervalMs = 1000; // 1 second
    setInterval(() => this.save(filePath), saveIntervalMs);
  }

  public async apply(event: DomainEvent): Promise<void> {
    // assumes that events are always ordered by timestamp
    if (event.timestamp < this.state.lastTimestamp) {
      return;
    }

    await this.updateModel(event);
    this.state.lastTimestamp = event.timestamp;
  }

  public async initialize(): Promise<void> {
    const events = await this.store.find(Q.ByLaterThan(this.state.lastTimestamp));

    for (const event of events) {
      await this.apply(event);
    }
  }

  public async replay(): Promise<void> {
    const events = await this.store.find(Q.All());

    this.state.addresses.clear();
    this.state.portfolios.clear();
    this.state.lastTimestamp = new Date(0);

    for (const event of events) {
      await this.apply(event);
    }
  }

  public portfolios(): Promise<Map<PortfolioId, Portfolio>> {
    return new Promise(resolve => {
      // deep clone to prevent extenal mutation of the projection
      const portfolios = new Map<PortfolioId, Portfolio>(
        superjson.parse(superjson.stringify(this.state.portfolios))
      );

      resolve(portfolios);
    });
  }

  public addresses(): Promise<Set<Address>> {
    return new Promise(resolve => {
      // deep clone to prevent extenal mutation of the projection
      const addresses = new Set<Address>(
        superjson.parse(superjson.stringify(this.state.addresses))
      );

      resolve(addresses);
    });
  }

  private load(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      console.warn(`InMemoryStoreProjection: File ${filePath} does not exist. Skipping load.`);
      return;
    }

    try {
      const serialized = fs.readFileSync(filePath, 'utf8');
      const state = superjson.parse<State>(serialized);

      state.portfolios.forEach(p => this.state.portfolios.set(p.id, p));
      state.addresses.forEach(a => this.state.addresses.add(a));

      this.state.lastTimestamp = state.lastTimestamp;
    } catch (error) {
      console.error(`InMemoryStoreProjection: Failed to load data from ${filePath}.`, error);
    }
  }

  private save(filePath: string): void {
    const serialized = superjson.stringify(this.state);
    fs.writeFileSync(filePath, serialized);
  }

  private async updateModel(event: DomainEvent): Promise<void> {
    switch (event.name) {
      case 'PortfolioCreated':
        return this.onPortfolioCreated(event as unknown as PortfolioCreated);
      case 'AssetCreated':
        return this.onAssetCreated(event as unknown as AssetCreated);
      case 'BuildingCreated':
        return this.onBuildingCreated(event as unknown as BuildingCreated);
      case 'PortfolioRollbacked':
        return this.onPortfolioRollbacked(event as unknown as PortfolioRollbacked);
      default:
        return console.warn(`InMemoryStoreProjection: Unknown event ${event.name}`);
    }
  }

  private onPortfolioCreated(event: PortfolioCreated): void {
    if (this.state.portfolios.has(event.aggregateId)) {
      console.error(
        `InMemoryStoreProjection: Portfolio with id ${event.aggregateId} already exists`
      );
      return;
    }

    this.state.portfolios.set(event.aggregateId, {
      id: event.aggregateId,
      name: event.payload.name,
      assets: new Set()
    });
  }

  private onAssetCreated(event: AssetCreated): void {
    const portfolio = this.state.portfolios.get(event.aggregateId);

    if (portfolio === undefined) {
      console.error(
        `InMemoryStoreProjection: Portfolio with id ${event.aggregateId} does not exist`
      );
      return;
    }

    portfolio.assets.add({ name: event.payload.name, buildings: new Set() });
  }

  private onBuildingCreated(event: BuildingCreated): void {
    const portfolio = this.state.portfolios.get(event.aggregateId);

    if (!portfolio) {
      console.error(
        `InMemoryStoreProjection: Portfolio with id ${event.aggregateId} does not exist`
      );
      return;
    }

    const asset = Array.from(portfolio.assets).find(
      asset => asset.name === event.payload.assetName
    );

    if (!asset) {
      console.error(
        `InMemoryStoreProjection: Asset with name ${event.payload.assetName} in portfolio with id ${event.aggregateId} does not exist`
      );
      return;
    }

    asset.buildings.add({ addresses: event.payload.addresses });
    event.payload.addresses.forEach(addr => this.state.addresses.add(addr));
  }

  private async onPortfolioRollbacked(event: PortfolioRollbacked): Promise<void> {
    // inefficient approach, but it's a projection, so good enough for now

    const portfolio = this.state.portfolios.get(event.aggregateId);

    if (!portfolio) {
      console.error(
        `InMemoryStoreProjection: Portfolio with id ${event.aggregateId} does not exist`
      );
      return;
    }

    const events = await this.store.find(
      Q.ByAggregateIdBeforeThan(event.aggregateId, event.payload.timestamp)
    );

    this.state.portfolios.delete(portfolio.id);

    for (const asset of portfolio.assets) {
      for (const building of asset.buildings) {
        for (const address of building.addresses) {
          this.state.addresses.delete(address);
        }
      }
    }

    for (const event of events) {
      await this.updateModel(event);
    }
  }
}
