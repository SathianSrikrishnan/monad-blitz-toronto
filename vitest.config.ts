import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  ssr: {
    noExternal: ["@x402/next"],
  },
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${fileURLToPath(new URL("./src/", import.meta.url))}/`,
      },
      {
        find: /^next\/server$/,
        replacement: fileURLToPath(
          new URL("./node_modules/next/server.js", import.meta.url),
        ),
      },
    ],
  },
});
