import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import fs from 'fs';

const packageVersion = JSON.parse(fs.readFileSync('package.json').toString())
  .version;

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es'
    },
    plugins: [
      typescript(),
      replace({
        __PACKAGE_VERSION__: packageVersion
      })
    ]
  },
  {
    input: 'src/client.ts',
    output: {
      file: 'dist/client.js',
      format: 'es'
    },
    plugins: [
      typescript(),
      replace({
        __PACKAGE_VERSION__: packageVersion
      })
    ]
  },
  {
    input: 'src/host.ts',
    output: {
      file: 'dist/host.js',
      format: 'es'
    },
    plugins: [
      typescript(),
      replace({
        __PACKAGE_VERSION__: packageVersion
      })
    ]
  }
];
