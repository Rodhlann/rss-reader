import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/main.ts',
  output: {
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
    copy({
      targets: [
        { src: 'src/public/css/**/*', dest: 'build/public/css' },
        { src: 'src/public/js/**/*', dest: 'build/public/js' }
      ],
    }),
  ],
};
