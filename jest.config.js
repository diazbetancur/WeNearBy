/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/__tests__/**', '!src/**/*.d.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      }
    ]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
