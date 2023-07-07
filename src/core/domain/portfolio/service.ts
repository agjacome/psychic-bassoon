import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type DomainEvent, type DomainEventDispatcher } from '../shared';
import { type Address, type Asset, type Building, PortfolioId, type Portfolio } from './types';
import { type PortfolioCreated, type AssetCreated, type BuildingCreated } from './events';
import { type PortfolioRepository } from './repository';
import {
  AddressAlreadyTaken,
  AssetAlreadyExists,
  AssetNotFound,
  PortfolioNotFound
} from './errors';

export interface PortfolioHistory {
  get(id: PortfolioId): Promise<DomainEvent[]>;
}

@sealed
export class PortfolioService {
  constructor(
    private readonly dispatcher = ServiceLocator.resolve<DomainEventDispatcher>(
      'DomainEventDispatcher'
    ),
    private readonly repository = ServiceLocator.resolve<PortfolioRepository>(
      'PortfolioRepository'
    ),
    private readonly history = ServiceLocator.resolve<PortfolioHistory>('PortfolioHistory')
  ) {}

  public async getPortfolioById(portfolioId: PortfolioId): Promise<Portfolio> {
    const portfolio = await this.repository.get(portfolioId);

    if (portfolio === null) {
      throw new PortfolioNotFound(portfolioId);
    }

    return portfolio;
  }

  public async getAllPortfolios(): Promise<Portfolio[]> {
    return await this.repository.all();
  }

  public async getPortfolioHistory(portfolioId: PortfolioId): Promise<DomainEvent[]> {
    return await this.history.get(portfolioId);
  }

  public async createPortfolio(
    name: string,
    onComplete: (portfolio: Portfolio) => void
  ): Promise<void> {
    const portfolioId = await this.generatePortfolioId();
    const portfolio: Portfolio = { id: portfolioId, name, assets: new Set() };

    await this.dispatcher.dispatch<PortfolioCreated>({
      name: 'PortfolioCreated',
      aggregateId: portfolioId,
      timestamp: new Date(),
      payload: { name }
    });

    onComplete(portfolio);
  }

  public async createAsset(
    portfolioId: PortfolioId,
    name: string,
    onComplete: (asset: Asset) => void
  ): Promise<void> {
    if (!(await this.portfolioExists(portfolioId))) {
      throw new PortfolioNotFound(portfolioId);
    }

    if (await this.assetExists(portfolioId, name)) {
      throw new AssetAlreadyExists(portfolioId, name);
    }

    const asset: Asset = { name, buildings: new Set() };

    await this.dispatcher.dispatch<AssetCreated>({
      name: 'AssetCreated',
      aggregateId: portfolioId,
      timestamp: new Date(),
      payload: { name }
    });

    onComplete(asset);
  }

  public async createBuilding(
    portfolioId: PortfolioId,
    assetName: string,
    addresses: Set<Address>,
    onComplete: (building: Building) => void
  ): Promise<void> {
    if (!(await this.portfolioExists(portfolioId))) {
      throw new PortfolioNotFound(portfolioId);
    }

    if (!(await this.assetExists(portfolioId, assetName))) {
      throw new AssetNotFound(portfolioId, assetName);
    }

    const existingAddresses = await this.filterExistingAddresses(addresses);
    if (existingAddresses.size > 0) {
      throw new AddressAlreadyTaken(existingAddresses);
    }

    const building: Building = { addresses };

    await this.dispatcher.dispatch<BuildingCreated>({
      name: 'BuildingCreated',
      aggregateId: portfolioId,
      timestamp: new Date(),
      payload: { assetName, addresses }
    });

    onComplete(building);
  }

  private async generatePortfolioId(): Promise<PortfolioId> {
    let portfolioId = PortfolioId.generate();

    while (await this.portfolioExists(portfolioId)) {
      portfolioId = PortfolioId.generate();
    }

    return portfolioId;
  }

  private async portfolioExists(portfolioId: PortfolioId): Promise<boolean> {
    return (await this.repository.get(portfolioId)) !== null;
  }

  private async assetExists(portfolioId: PortfolioId, assetName: string): Promise<boolean> {
    const portfolio = await this.repository.get(portfolioId);

    if (portfolio === null) {
      return false;
    }

    return Array.from(portfolio.assets).some(asset => asset.name === assetName);
  }

  private async filterExistingAddresses(addresses: Set<Address>): Promise<Set<Address>> {
    const existing = await this.repository.addresses();

    const duplicates = Array.from(addresses).filter(a => existing.has(a));

    return new Set(duplicates);
  }
}
