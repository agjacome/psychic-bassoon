import { getEnvStr, getEnvNum } from '../../core/infrastructure/config';

export const RestConfig = Object.freeze({
  PORT: getEnvNum('PORT', 3000),
  BASE_PATH: getEnvStr('BASE_PATH', '/')
});
