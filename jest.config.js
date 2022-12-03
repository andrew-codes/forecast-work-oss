module.exports = {
  collectCoverageFrom: ["src/**/*.ts", "src/*.ts"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/",
    "src/main/main.ts",
  ],
  moduleFileExtensions: ["json", "js", "ts"],
  preset: "ts-jest",
  coverageReporters: ["cobertura", "lcov", "text"],
  resetMocks: true,
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.test.json",
    },
  },
  testMatch: ["<rootDir>/src/**/__tests__/*.*"],
}
