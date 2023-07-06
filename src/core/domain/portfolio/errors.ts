import { sealed } from '@shared/decorators';
import { DomainException } from '../shared';
import { PortfolioId, type Address } from './types';

@sealed
export class InvalidPortfolioId extends DomainException {
  constructor(portfolioId: string) {
    super('INVALID_PORTFOLIO_ID', `Invalid portfolio id: ${portfolioId}`);
  }
}

@sealed
export class PortfolioNotFound extends DomainException {
  constructor(portfolioId: PortfolioId) {
    super('PORTFOLIO_NOT_FOUND', `Portfolio with id ${portfolioId} does not exist`);
  }
}

@sealed
export class AssetNotFound extends DomainException {
  constructor(portfolioId: PortfolioId, name: string) {
    super('ASSET_NOT_FOUND', `Asset with name ${name} does not exist in portfolio ${portfolioId}`);
  }
}

@sealed
export class AssetAlreadyExists extends DomainException {
  constructor(portfolioId: PortfolioId, name: string) {
    super(
      'ASSET_ALREADY_EXISTS',
      `Asset with name ${name} already exists in portfolio ${portfolioId}`
    );
  }
}

@sealed
export class AddressAlreadyTaken extends DomainException {
  constructor(addresses: Set<Address>) {
    super('ADDRESS_ALREADY_TAKEN', `Addresses already taken: ${Array.from(addresses).join(', ')}`);
  }
}
