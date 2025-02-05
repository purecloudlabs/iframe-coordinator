import { nodeResolve } from "@rollup/plugin-node-resolve";

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  input: [
    resolve(__dirname, "client-app.js"),
    resolve(__dirname, "client-worker.js"),
  ],
  output: {
    preserveModules: false,
    dir: "dist",
  },
  plugins: [nodeResolve()],
};
