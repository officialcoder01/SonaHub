module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>", "<rootDir>/../Test/backend"],
  testMatch: ["**/?(*.)+(spec|test).js"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  moduleNameMapper: {
    "^(.*)/authService\\.js$": "$1/authService.ts",
    "^(.*)/activityType\\.js$": "$1/activityType.ts",
  },
  transform: {
    "^.+\\.[jt]s$": "<rootDir>/jest-esm-to-cjs-transformer.cjs",
  },
};
