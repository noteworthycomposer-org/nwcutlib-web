const { build } = require('esbuild');
const { replace } = require('esbuild-plugin-replace');
const { luamin } = require('./loader/luamin');
const pkg_json = require('./package.json');

build({
	entryPoints: ['./src/main.js'],
	bundle: true,
	treeShaking: true,
	minify: true,
	sourcemap: true,
	target: 'es2020',
	outfile: './public/nwcutlib.js',
	loader: {
		'.lua': 'text',
		'.ttf': 'dataurl'
	},
	plugins: [
		replace({
			include: /\b(fengari|fengari-interop).+\.js$/,
			values: {
				'process.env.FENGARICONF': 'void 0',
				'typeof process': '"undefined"'
			}
		}),
		replace({
			include: /\bmain\.js$/,
			values: {
				'PKG_VERSION': JSON.stringify(pkg_json.version)
			}
		}),
		luamin({include: /\.lua$/})
	],
})