import { getEnvStr, getEnvNum } from '@shared/utils';

export const RestConfig = Object.freeze({
  PORT: getEnvNum('PORT', 3000),
  BASE_PATH: getEnvStr('BASE_PATH', '/')
});
