import esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import esbuild_replace from './tools/esbuild_replace.js';
import esbuild_luamin from './tools/esbuild_luamin.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg_json = require('./package.json')

const bldo = {
	entryPoints: ['src/index.html'],
	bundle: true,
	treeShaking: true,
	minify: true,
	sourcemap: true,
	target: 'es2020',
	outdir: 'public',
	assetNames: 'assets/[name]-[hash]',
    chunkNames: '[ext]/[name]-[hash]',
	loader: {
		'.lua': 'text',
		'.ttf': 'dataurl'
	},
	plugins: [
		htmlPlugin(),
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
}

if (process.argv[2] == '--serve') {
	console.log('serve mode: http://127.0.0.1:8000/');
	let ctx = await esbuild.context(bldo);
	let { host, port } = await ctx.serve({
		servedir: 'public',
		host: '127.0.0.1',
		port: 8000
	});
} else {
	console.log('build mode');
	await esbuild.build(bldo);
}
