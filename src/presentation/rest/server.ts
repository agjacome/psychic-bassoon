import cors from 'cors';
import express from 'express';

import { sealed } from '@shared/decorators';
import { ServiceLocator } from '@shared/utils';
import { RestConfig } from './config';
import { type PortfolioController } from './portfolio/controller';
import { PortfolioRoutes } from './portfolio/routes';
import { PortfolioErrorMiddleware } from './portfolio/middleware';

@sealed
export class Server {
  private readonly app: express.Express;

  constructor(
    private readonly portfolio = ServiceLocator.resolve<PortfolioController>('PortfolioController')
  ) {
    this.app = express();
    this.app.disable('x-powered-by');

    this.app.use([cors(), express.json(), express.urlencoded({ extended: true })]);

    this.app.use(RestConfig.BASE_PATH, this.router());
    this.app.use(this.middleware());
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

  private router(): express.Router {
    const router = express.Router();

    PortfolioRoutes.setup(router, this.portfolio);

    return router;
  }

  private middleware() {
    return [PortfolioErrorMiddleware];
  }
}
