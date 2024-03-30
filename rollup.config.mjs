import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/main.ts',
  output: {
    sourcemap: true,
    file: './build/bundle.js',
    format: 'cjs',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
		json(),
    typescript({
      tsconfig: 'tsconfig.json',
      rootDir: './src',
    }),
  ],
};
