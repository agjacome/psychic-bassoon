import type express from 'express';

import { type PortfolioController } from './controller';

export function setup(router: express.Router, controller: PortfolioController): void {
  router.get('/portfolios/:portfolioId', (req, res, next) => {
    controller.getPortfolioById(req, res).catch(next);
  });

  router.get('/portfolios', (req, res, next) => {
    controller.getAllPortfolios(req, res).catch(next);
  });

  router.post('/portfolios', (req, res, next) => {
    controller.createPortfolio(req, res).catch(next);
  });

  router.post('/portfolios/:portfolioId/assets', (req, res, next) => {
    controller.createAsset(req, res).catch(next);
  });

  router.post('/portfolios/:portfolioId/assets/:assetName/buildings', (req, res, next) => {
    controller.createBuilding(req, res).catch(next);
  });
};
