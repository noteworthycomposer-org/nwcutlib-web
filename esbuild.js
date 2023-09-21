const fs = require('fs');
const { build } = require('esbuild');
const gzipme = require('gzipme');
const esbuild_replace = require('./build/esbuild_replace');
const esbuild_luamin = require('./build/esbuild_luamin');
const pkg_json = require('./package.json');

const outFilename = './public/nwcutlib.js';

build({
	entryPoints: ['./src/main.js'],
	bundle: true,
	treeShaking: true,
	minify: true,
	sourcemap: true,
	target: 'es2020',
	outfile: outFilename,
	loader: {
		'.lua': 'text',
		'.ttf': 'dataurl'
	},
	plugins: [
		esbuild_replace({
			include: /\b(fengari|fengari-interop).+\.js$/,
			define: {
				'process.env.FENGARICONF': 'void 0',
				'typeof process': JSON.stringify('undefined')
			}
		}),
		esbuild_replace({
			include: /\bmain\.js$/,
			define: {
				'PKG_VERSION': JSON.stringify(pkg_json.version)
			}
		}),
		esbuild_luamin({include: /\.lua$/})
	],
})

gzipme(outFilename, {mode:'best', output: `${outFilename}.gz`});
