import { ServiceLocator } from '@shared/utils';
import * as core from '@core/infrastructure/bootstrap';
import * as rest from '@presentation/rest/bootstrap';
import { type Server } from '@presentation/rest/server';

const main = async () => {
  await core.bootstrap();
  console.log('Core initialized');

  await rest.bootstrap();
  console.log('REST API initialized');

  const server = ServiceLocator.resolve<Server>('Server');
  server.start();
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
