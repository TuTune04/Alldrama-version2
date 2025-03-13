/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    "**/__tests__/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)"
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/models/index.ts',
    '!src/index.ts',
    '!src/__tests__/**/*'
  ],
  moduleNameMapper: {
    '^ioredis$': '<rootDir>/src/__mocks__/ioredis.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
}; 