import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type PortfolioService } from '@core/domain/portfolio/service';
import { type Portfolio, PortfolioId } from '@core/domain/portfolio/types';
import { InvalidPortfolioId } from '@core/domain/portfolio/errors';
import { type QueryHandler, type Query } from '../shared';

export type GetPortfolio = Query<'GetPortfolio', { portfolioId: string }, Portfolio>;

export type GetAllPortfolios = Query<'GetAllPortfolios', Record<string, never>, Array<Portfolio>>;

@sealed
export class GetPortfolioHandler implements QueryHandler<GetPortfolio> {
  public readonly queryName = 'GetPortfolio';

  constructor(
    private readonly service = ServiceLocator.resolve<PortfolioService>('PortfolioService')
  ) {}

  public async handle(query: GetPortfolio): Promise<Portfolio> {
    const portfolioId = PortfolioId.parse(query.arguments.portfolioId);

    if (portfolioId === null) {
      throw new InvalidPortfolioId(query.arguments.portfolioId);
    }

    return await this.service.getPortfolioById(portfolioId);
  }
}

@sealed
export class GetAllPortfoliosHandler implements QueryHandler<GetAllPortfolios> {
  public readonly queryName = 'GetAllPortfolios';

  constructor(
    private readonly service = ServiceLocator.resolve<PortfolioService>('PortfolioService')
  ) {}

  public async handle(): Promise<Array<Portfolio>> {
    return await this.service.getAllPortfolios();
  }
}
