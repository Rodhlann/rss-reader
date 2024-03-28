import typescript from '@rollup/plugin-typescript';

export default {
	input: 'dist/main.js',
	output: {
		sourcemap: true,
		file: './build/bundle.js',
		format: 'cjs'
	},
	plugins: [
		typescript()
	]
};