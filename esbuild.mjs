import {unlink} from 'fs';
import esbuild from 'esbuild';
import esbuild_replace from './tools/esbuild_replace.js';
import esbuild_luamin from './tools/esbuild_luamin.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg_json = require('./package.json')

// kill any past gz version
unlink('public/nwcutlib.js.gz',(err) => {});

const bldo = {
	entryPoints: ['src/nwcutlib.js'],
	bundle: true,
	treeShaking: true,
	minify: true,
	sourcemap: true,
	target: 'es2020',
	outdir: 'public',
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
			include: /\bnwcutlib\.js$/,
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
	await ctx.serve({
		servedir: 'public',
		host: '127.0.0.1',
		port: 8000
	});
} else {
	console.log('build mode');
	await esbuild.build(bldo);
}
