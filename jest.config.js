/** إعداد Jest لتطبيق تألق (Expo). */
module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.expo/", "/dist/"],
  collectCoverageFrom: ["lib/**/*.ts", "!lib/**/*.d.ts"],
};
