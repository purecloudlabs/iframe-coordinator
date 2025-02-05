import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import fs from "fs";

const packageVersion = JSON.parse(
  fs.readFileSync("package.json").toString(),
).version;

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
    },
    plugins: [
      typescript(),
      replace({
        preventAssignment: true,
        values: {
          __PACKAGE_VERSION__: packageVersion,
        },
      }),
      commonjs(),
      nodeResolve(),
    ],
  },
  {
    input: "src/client.ts",
    output: {
      file: "dist/client.js",
      format: "es",
    },
    plugins: [
      typescript(),
      replace({
        preventAssignment: true,
        values: {
          __PACKAGE_VERSION__: packageVersion,
        },
      }),
      commonjs(),
      nodeResolve(),
    ],
  },
  {
    input: "src/workerClient.ts",
    output: {
      file: "dist/workerClient.js",
      format: "es",
    },
    plugins: [
      typescript(),
      replace({
        preventAssignment: true,
        values: {
          __PACKAGE_VERSION__: packageVersion,
        },
      }),
      commonjs(),
      nodeResolve(),
    ],
  },
  {
    input: "src/host.ts",
    output: {
      file: "dist/host.js",
      format: "es",
    },
    plugins: [
      typescript(),
      replace({
        preventAssignment: true,
        values: {
          __PACKAGE_VERSION__: packageVersion,
        },
      }),
      commonjs(),
      nodeResolve(),
    ],
  },
];
