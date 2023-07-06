import { type Request, type Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { serialize } from 'superjson';
import { z } from 'zod';

import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type CommandDispatcher, type QueryProcessor } from '@core/application/shared';
import {
  type CreateBuilding,
  type CreateAsset,
  type CreatePortfolio
} from '@core/application/portfolio/commands';
import { type GetAllPortfolios, type GetPortfolio } from '@core/application/portfolio/queries';

const CreatePortfolioSchema = z.object({ name: z.string() });
const CreateAssetSchema = z.object({ name: z.string() });
const CreateBuildingSchema = z.object({ addresses: z.array(z.string()) });

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

  public async getAllPortfolios(_req: Request, res: Response): Promise<void> {
    const portfolios = await this.processor.process<GetAllPortfolios>({
      name: 'GetAllPortfolios',
      arguments: {}
    });

    res.status(StatusCodes.OK).json(serialize(portfolios));
  }

  public async createPortfolio(req: Request, res: Response): Promise<void> {
    const { name } = CreatePortfolioSchema.parse(req.body);

    await this.dispatcher.dispatch<CreatePortfolio>({
      name: 'CreatePortfolio',
      arguments: { name }
    });

    res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED);
  }

  public async createAsset(req: Request, res: Response): Promise<void> {
    const portfolioId = req.params.portfolioId;
    const { name } = CreateAssetSchema.parse(req.body);

    await this.dispatcher.dispatch<CreateAsset>({
      name: 'CreateAsset',
      arguments: { portfolioId, name }
    });

    res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED);
  }

  public async createBuilding(req: Request, res: Response): Promise<void> {
    const portfolioId = req.params.portfolioId;
    const assetName = req.params.assetName;
    const { addresses } = CreateBuildingSchema.parse(req.body);

    await this.dispatcher.dispatch<CreateBuilding>({
      name: 'CreateBuilding',
      arguments: { portfolioId, assetName, addresses: new Set(addresses) }
    });

    res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED);
  }
}