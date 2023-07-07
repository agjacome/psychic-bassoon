import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { type PortfolioService } from '@core/domain/portfolio/service';
import { type Portfolio, PortfolioId } from '@core/domain/portfolio/types';
import { InvalidPortfolioId } from '@core/domain/portfolio/errors';
import { type QueryHandler, type Query } from '../shared';

export type GetPortfolio = Query<'GetPortfolio', { portfolioId: string }, Portfolio>;

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

export type GetAllPortfolios = Query<'GetAllPortfolios', Record<string, never>, Portfolio[]>;

@sealed
export class GetAllPortfoliosHandler implements QueryHandler<GetAllPortfolios> {
  public readonly queryName = 'GetAllPortfolios';

  constructor(
    private readonly service = ServiceLocator.resolve<PortfolioService>('PortfolioService')
  ) {}

  public async handle(): Promise<Portfolio[]> {
    return await this.service.getAllPortfolios();
  }
}

type PortfolioHistoryDTO = {
  portfolioId: string;
  history: Array<{
    timestamp: Date;
    change: string;
    payload: Record<string, unknown>;
  }>;
};

export type GetPortfolioHistory = Query<
  'GetPortfolioHistory',
  { portfolioId: string },
  PortfolioHistoryDTO
>;

@sealed
export class GetPortfolioHistoryHandler implements QueryHandler<GetPortfolioHistory> {
  public readonly queryName = 'GetPortfolioHistory';

  constructor(
    private readonly service = ServiceLocator.resolve<PortfolioService>('PortfolioService')
  ) {}

  public async handle(query: GetPortfolioHistory): Promise<PortfolioHistoryDTO> {
    const portfolioId = PortfolioId.parse(query.arguments.portfolioId);

    if (portfolioId === null) {
      throw new InvalidPortfolioId(query.arguments.portfolioId);
    }

    const events = await this.service.getPortfolioHistory(portfolioId);

    const history = events.map(event => {
      return {
        timestamp: event.timestamp,
        change: event.name,
        payload: event.payload
      };
    });

    return { portfolioId, history };
  }
}
