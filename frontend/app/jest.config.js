module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  transformIgnorePatterns: ["node_modules/(?!.*\\.mjs$)"],
};
