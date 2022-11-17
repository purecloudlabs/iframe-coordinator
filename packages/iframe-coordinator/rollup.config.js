import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es'
    },
    plugins: [typescript(), replace({
      __PACKAGE_VERSION__: pkg.version
    })]
  },
  {
    input: 'src/client.ts',
    output: {
      file: 'dist/client.js',
      format: 'es'
    },
    plugins: [typescript(), replace({
      __PACKAGE_VERSION__: pkg.version
    })]
  },
  {
    input: 'src/host.ts',
    output: {
      file: 'dist/host.js',
      format: 'es'
    },
    plugins: [typescript(), replace({
      __PACKAGE_VERSION__: pkg.version
    })]
  }
];
