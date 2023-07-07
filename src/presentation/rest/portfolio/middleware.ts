import { type NextFunction, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import superjson from 'superjson';

import { DomainException } from '@core/domain/shared';

export function PortfolioErrorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!(err instanceof DomainException) || !(err.code in statuses)) {
    return next(err);
  }

  const status = statuses[err.code];
  const body = { code: err.code, message: err.message };

  res.status(status).json(superjson.serialize(body));
}

const statuses: Record<string, StatusCodes> = Object.freeze({
  INVALID_PORTFOLIO_ID: StatusCodes.BAD_REQUEST,
  PORTFOLIO_NOT_FOUND: StatusCodes.NOT_FOUND,
  ASSET_NOT_FOUND: StatusCodes.NOT_FOUND,
  ASSET_ALREADY_EXISTS: StatusCodes.CONFLICT,
  ADDRESS_ALREADY_TAKEN: StatusCodes.CONFLICT,
  INVALID_ROLLBACK_TIMESTAMP: StatusCodes.BAD_REQUEST
});
