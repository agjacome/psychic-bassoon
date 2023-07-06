import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type DomainEventDispatcher } from '../shared';
import { type Address, type Asset, type Building, PortfolioId, type Portfolio } from './types';
import { type PortfolioCreated, type AssetCreated, type BuildingCreated } from './events';
import { type PortfolioRepository } from './repository';
import {
  AddressAlreadyTaken,
  AssetAlreadyExists,
  AssetNotFound,
  PortfolioNotFound
} from './errors';

@sealed
export class PortfolioService {
  constructor(
    private readonly dispatcher = ServiceLocator.resolve<DomainEventDispatcher>(
      'DomainEventDispatcher'
    ),
    private readonly repository = ServiceLocator.resolve<PortfolioRepository>('PortfolioRepository')
  ) {}

  public async getPortfolioById(portfolioId: PortfolioId): Promise<Portfolio> {
    const portfolio = await this.repository.get(portfolioId);

    if (portfolio === null) {
      throw new PortfolioNotFound(portfolioId);
    }

    return portfolio;
  }

  public async getAllPortfolios(): Promise<Array<Portfolio>> {
    return await this.repository.all();
  }

  public async createPortfolio(name: string): Promise<Portfolio> {
    const portfolioId = await this.generatePortfolioId();
    const portfolio: Portfolio = { id: portfolioId, name, assets: new Set() };

    await this.dispatcher.dispatch<PortfolioCreated>({
      name: 'PortfolioCreated',
      aggregateId: portfolioId,
      timestamp: new Date(),
      payload: { name }
    });

    return portfolio;
  }

  public async createAsset(portfolioId: PortfolioId, name: string): Promise<Asset> {
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

    return asset;
  }

  public async createBuilding(
    portfolioId: PortfolioId,
    assetName: string,
    addresses: Set<Address>
  ): Promise<Building> {
    if (!(await this.portfolioExists(portfolioId))) {
      throw new PortfolioNotFound(portfolioId);
    }

    if (!(await this.assetExists(portfolioId, assetName))) {
      throw new AssetNotFound(portfolioId, assetName);
    }

    if (await this.addressExists(addresses)) {
      throw new AddressAlreadyTaken(addresses);
    }

    const building: Building = { addresses };

    await this.dispatcher.dispatch<BuildingCreated>({
      name: 'BuildingCreated',
      aggregateId: portfolioId,
      timestamp: new Date(),
      payload: { assetName, addresses }
    });

    return building;
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

  private async addressExists(addresses: Set<Address>): Promise<boolean> {
    const existing = await this.repository.addresses();
    return Array.from(addresses).some(a => existing.has(a));
  }
}
