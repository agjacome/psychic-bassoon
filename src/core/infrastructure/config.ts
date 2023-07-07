import { getEnvStr } from '@shared/utils';

export const CoreConfig = Object.freeze({
  READ_PROJECTION_FILE: getEnvStr('READ_PROJECTION_FILE', 'event-store.json')
});
