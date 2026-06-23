module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>", "<rootDir>/../Test/backend"],
  testMatch: ["**/?(*.)+(spec|test).js"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  transform: {
    "^.+\\.js$": "<rootDir>/jest-esm-to-cjs-transformer.cjs",
  },
};
