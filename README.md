very messages such events many sourcing no tests wow

bore:
```
$ nix develop

$ cp .env.example .env

$ pnpm install
$ pnpm run prisma:migrate
$ pnpm run prisma:generate

$ pnpm run dev
```

fun:
```
$ curl -X POST -v http://localhost:3333/portfolios -H 'Content-Type: application/json' -d '{ "name": "test" }'
$ curl -X GET  -v http://localhost:3333/portfolios
$ curl -X POST -v http://localhost:3333/portfolios/{ID}/assets -H 'Content-Type: application/json' -d '{ "name": "asset1" }'
$ curl -X POST -v http://localhost:3333/portfolios/{ID}/assets/asset1/buildings -H 'Content-Type: application/json' -d '{ "addresses": ["addr1", "addr2"]}'
$ curl -X GET  -v http://localhost:3333/portfolios/{ID}/history
$ curl -X PUT  -v http://localhost:3333/portfolios/{ID}/rollback -H 'Content-Type: application/json' -d '{ "timestamp": "2023-07-07T15:00Z" }'
```
