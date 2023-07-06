import cors from 'cors';
import express from 'express';

import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { RestConfig } from './config';
import { type PortfolioController } from './portfolio/controller';
import * as portfolioRoutes from './portfolio/routes';

@sealed
export class Server {
  private readonly app: express.Express;

  constructor(
    private readonly portfolio = ServiceLocator.resolve<PortfolioController>('PortfolioController')
  ) {
    this.app = express();

    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(RestConfig.BASE_PATH, this.router());

    this.app.disable('x-powered-by');
  }

  public start() {
    try {
      this.app.listen(RestConfig.PORT, () => {
        console.log(`Server is listening on port ${RestConfig.PORT}`);
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  private router() {
    const router = express.Router();

    portfolioRoutes.setup(router, this.portfolio);

    return router;
  }
}
