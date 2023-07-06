import { ServiceLocator } from '@shared/utils';
import { PortfolioController } from './portfolio/controller';
import { Server } from './server';

export const bootstrap = async () => {
  const factories: Record<string, () => unknown> = {
    PortfolioController: () => {
      return new PortfolioController();
    },
    Server: () => {
      return new Server();
    }
  };

  Object.entries(factories).forEach(([name, factory]) => {
    ServiceLocator.register(name, factory);
  });

  return Promise.resolve();
};
