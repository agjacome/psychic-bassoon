import type express from 'express';

import { type PortfolioController } from './controller';

export const PortfolioRoutes = {
  getPortfolioById: '/portfolios/:portfolioId',
  getPortfolioHistory: '/portfolios/:portfolioId/history',
  getAllPortfolios: '/portfolios',
  createPortfolio: '/portfolios',
  createAsset: '/portfolios/:portfolioId/assets',
  createBuilding: '/portfolios/:portfolioId/assets/:assetName/buildings',

  setup(router: express.Router, controller: PortfolioController): void {
    router.get(this.getPortfolioById, (req, res, next) => {
      controller.getPortfolioById(req, res).catch(next);
    });

    router.get(this.getPortfolioHistory, (req, res, next) => {
      controller.getPortfolioHistory(req, res).catch(next);
    });

    router.get(this.getAllPortfolios, (req, res, next) => {
      controller.getAllPortfolios(req, res).catch(next);
    });

    router.post(this.createPortfolio, (req, res, next) => {
      controller.createPortfolio(req, res).catch(next);
    });

    router.post(this.createAsset, (req, res, next) => {
      controller.createAsset(req, res).catch(next);
    });

    router.post(this.createBuilding, (req, res, next) => {
      controller.createBuilding(req, res).catch(next);
    });
  }
};
