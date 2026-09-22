module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>", "<rootDir>/../Test/backend"],
  testMatch: ["**/?(*.)+(spec|test).js"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.[jt]s$": ["@swc/jest", {
      jsc: {
        parser: {
          syntax: "typescript",
        },
        target: "es2022",
      },
      module: {
        type: "commonjs",
      },
    }],
  },
};
