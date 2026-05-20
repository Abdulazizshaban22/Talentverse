
module.exports = { preset: 'ts-jest', testEnvironment: 'node', collectCoverage: true, collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: { global: { lines: 0.75, statements: 0.75, functions: 0.75, branches: 0.5 } } };
