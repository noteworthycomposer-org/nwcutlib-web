const fs = require('fs');
const { build } = require('esbuild');
const { replace } = require('esbuild-plugin-replace');
const luamin = require('luamin');
const pkg_json = require('./package.json');

let luamin_loader = (options = {}) => {
	return {
		name: 'luamin',
		setup(build) {
			build.onLoad({ filter: options.include }, async (args) => {
				const source = await fs.promises.readFile(args.path, "utf8");
				const contents = luamin.minify(source);
				return { contents, loader: 'default' };				
			});
		}
	}
}

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
		luamin_loader({include: /\.lua$/})
	],
})