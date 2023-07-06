import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { PortfolioId } from '@core/domain/portfolio/types';
import { type PortfolioService } from '@core/domain/portfolio/service';
import { type CommandHandler, type Command } from '../shared';
import { InvalidPortfolioId } from '@core/domain/portfolio/errors';

export type CreatePortfolio = Command<'CreatePortfolio', { name: string }>;

export type CreateAsset = Command<'CreateAsset', { portfolioId: string; name: string }>;

export type CreateBuilding = Command<
  'CreateBuilding',
  { portfolioId: string; assetName: string; addresses: Set<string> }
>;

@sealed
export class CreatePortfolioHandler implements CommandHandler<CreatePortfolio> {
  constructor(
    private readonly service = ServiceLocator.resolve<PortfolioService>('PortfolioService')
  ) {}

  public matches(command: Command): command is CreatePortfolio {
    return command.name === 'CreatePortfolio';
  }

  public async handle(command: CreatePortfolio): Promise<void> {
    await this.service.createPortfolio(command.arguments.name);
  }
}

@sealed
export class CreateAssetHandler implements CommandHandler<CreateAsset> {
  constructor(
    private readonly service = ServiceLocator.resolve<PortfolioService>('PortfolioService')
  ) {}

  public matches(command: Command): command is CreateAsset {
    return command.name === 'CreateAsset';
  }

  public async handle(command: CreateAsset): Promise<void> {
    const portfolioId = PortfolioId.parse(command.arguments.portfolioId);

    if (portfolioId === null) {
      throw new InvalidPortfolioId(command.arguments.portfolioId);
    }

    await this.service.createAsset(portfolioId, command.arguments.name);
  }
}

@sealed
export class CreateBuildingHandler implements CommandHandler<CreateBuilding> {
  constructor(
    private readonly service = ServiceLocator.resolve<PortfolioService>('PortfolioService')
  ) {}

  public matches(command: Command): command is CreateBuilding {
    return command.name === 'CreateBuilding';
  }

  public async handle(command: CreateBuilding): Promise<void> {
    const portfolioId = PortfolioId.parse(command.arguments.portfolioId);

    if (portfolioId === null) {
      throw new InvalidPortfolioId(command.arguments.portfolioId);
    }

    await this.service.createBuilding(
      portfolioId,
      command.arguments.assetName,
      command.arguments.addresses
    );
  }
}
