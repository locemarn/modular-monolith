export const baseConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/apps/shared/test-utils/setup/jest.setup.ts'],
  collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts', '!**/*.module.ts'],
  testTimeout: 30000,
}

export const createAppConfig = (appName) => ({
  ...baseConfig,
  rootDir: '.',
  coverageDirectory: `../../coverage/${appName}`,
  setupFilesAfterEnv: [
    '<rootDir>/../../apps/shared/test-utils/setup/jest.setup.ts',
  ],
})
