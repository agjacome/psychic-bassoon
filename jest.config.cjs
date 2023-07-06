// eslint-disable-next-line @typescript-eslint/no-var-requires
const jest = require('ts-jest');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('get-tsconfig').getTsconfig('./tsconfig.json');
const tsPaths = tsConfig?.config.compilerOptions?.paths || {};

module.exports = {
  verbose: true,
  rootDir: './',
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  testMatch: ['<rootDir>/test/**/?(*.)+(unit|int|e2e|test).(ts|js)'],
  preset: 'ts-jest',
  transform: {
    '^.+.ts?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json'
      }
    ]
  },
  moduleNameMapper: jest.pathsToModuleNameMapper(tsPaths, {
    prefix: '<rootDir>'
  }),
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts', 'jest-extended/all'],
  clearMocks: true,
  collectCoverage: false,
  reporters: ['default']
};
