import type { Config } from "jest";
import {pathsToModuleNameMapper} from "ts-jest";
/** @type {import('ts-jest').JestConfigWithTsJest} */

const config: Config = {
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  preset: "ts-jest",
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: pathsToModuleNameMapper({
    "@/*": ["src/*"]
  }),
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/test-utils/"],
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
      "\.test\.ts$",
      "index\.ts$"
  ],
  globalSetup: "./test-utils/globalSetup.ts"
};

export default config;
