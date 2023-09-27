const fs = require('fs')
const { build } = require('esbuild')
const esbuild_replace = require('./tools/esbuild_replace')
const esbuild_luamin = require('./tools/esbuild_luamin')
const pkg_json = require('./package.json')

const outFilename = './public/nwcutlib.js'

// kill the gzip version if it exists
fs.rmSync(`${outFilename}.gz`,{force:true})

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
