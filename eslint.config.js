// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // The React-Compiler-powered react-hooks rules flag intentional patterns we
    // rely on deliberately — one-way form hydration from an async query and
    // external-system sync (sockets) inside effects, plus manual memoization the
    // compiler can't statically preserve. Keep them as visible warnings rather
    // than build-blocking errors.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);
