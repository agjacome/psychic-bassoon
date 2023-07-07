import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { serialize } from 'superjson';
import { z } from 'zod';

import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type PortfolioId } from '@core/domain/portfolio/types';
import { type CommandDispatcher, type QueryProcessor } from '@core/application/shared';
import {
  type CreateBuilding,
  type CreateAsset,
  type CreatePortfolio,
  type RollbackPortfolio
} from '@core/application/portfolio/commands';
import {
  type GetPortfolioHistory,
  type GetAllPortfolios,
  type GetPortfolio
} from '@core/application/portfolio/queries';
import { PortfolioRoutes } from './routes';

const CreatePortfolioSchema = z.object({ name: z.string() });
const CreateAssetSchema = z.object({ name: z.string() });
const CreateBuildingSchema = z.object({ addresses: z.array(z.string()) });
const RollbackPortfolioSchema = z.object({ timestamp: z.coerce.date() });

@sealed
export class PortfolioController {
  constructor(
    private readonly processor = ServiceLocator.resolve<QueryProcessor>('QueryProcessor'),
    private readonly dispatcher = ServiceLocator.resolve<CommandDispatcher>('CommandDispatcher')
  ) {}

  public async getPortfolioById(req: Request, res: Response): Promise<void> {
    const portfolio = await this.processor.process<GetPortfolio>({
      name: 'GetPortfolio',
      arguments: { portfolioId: req.params.portfolioId }
    });

    res.status(StatusCodes.OK).json(serialize(portfolio));
  }

  public async getPortfolioHistory(req: Request, res: Response): Promise<void> {
    const portfolioHistory = await this.processor.process<GetPortfolioHistory>({
      name: 'GetPortfolioHistory',
      arguments: { portfolioId: req.params.portfolioId }
    });

    res.status(StatusCodes.OK).json(serialize(portfolioHistory));
  }

  public async getAllPortfolios(_req: Request, res: Response): Promise<void> {
    const portfolios = await this.processor.process<GetAllPortfolios>({
      name: 'GetAllPortfolios',
      arguments: {}
    });

    res.status(StatusCodes.OK).json(serialize(portfolios));
  }

  public async createPortfolio(req: Request, res: Response): Promise<void> {
    const { name } = CreatePortfolioSchema.parse(req.body);

    const buildLocation = (id: PortfolioId) =>
      PortfolioRoutes.getPortfolioById.replace(':portfolioId', id);

    await this.dispatcher.dispatch<CreatePortfolio>({
      name: 'CreatePortfolio',
      arguments: { name, onComplete: id => res.location(buildLocation(id)) }
    });

    res.status(StatusCodes.CREATED).send();
  }

  public async createAsset(req: Request, res: Response): Promise<void> {
    const portfolioId = req.params.portfolioId;
    const { name } = CreateAssetSchema.parse(req.body);

    await this.dispatcher.dispatch<CreateAsset>({
      name: 'CreateAsset',
      arguments: { portfolioId, name }
    });

    res.status(StatusCodes.CREATED).send();
  }

  public async createBuilding(req: Request, res: Response): Promise<void> {
    const portfolioId = req.params.portfolioId;
    const assetName = req.params.assetName;
    const { addresses } = CreateBuildingSchema.parse(req.body);

    await this.dispatcher.dispatch<CreateBuilding>({
      name: 'CreateBuilding',
      arguments: { portfolioId, assetName, addresses: new Set(addresses) }
    });

    res.status(StatusCodes.CREATED).send();
  }

  public async rollbackPortfolio(req: Request, res: Response): Promise<void> {
    const portfolioId = req.params.portfolioId;
    const { timestamp } = RollbackPortfolioSchema.parse(req.body);

    await this.dispatcher.dispatch<RollbackPortfolio>({
      name: 'RollbackPortfolio',
      arguments: { portfolioId, timestamp }
    });

    res.status(StatusCodes.ACCEPTED).send();
  }
}
