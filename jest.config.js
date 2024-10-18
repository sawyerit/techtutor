/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./src/service/jest.mocks.js'],
    testPathIgnorePatterns: ["/node_modules/","/*.test.tsx"]
  };