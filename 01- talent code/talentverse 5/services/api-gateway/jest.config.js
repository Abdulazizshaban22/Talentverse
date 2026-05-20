
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: { global: { lines: 75, statements: 75, functions: 75, branches: 50 } },
};
