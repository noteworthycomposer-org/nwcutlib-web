const fs = require('fs');
const { build } = require('esbuild');
const luamin = require('luamin');
const pkg_json = require('./package.json');
const { replace } = require('esbuild-plugin-replace');

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

let newreplace = (options = {}) => {
	return {
		name: 'newreplace',
		setup(build) {
			build.onLoad({ filter: options.include }, async (args) => {
				let contents = await fs.promises.readFile(args.path, "utf8");
				for (const k in options.values) {
					contents = contents.replaceAll(k,options.values[k]);
				}
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
		newreplace({
			include: /\b(fengari|fengari-interop).+\.js$/,
			values: {
				'process.env.FENGARICONF': 'void 0',
				'typeof process': JSON.stringify('undefined')
			}
		}),
		newreplace({
			include: /\bmain\.js$/,
			values: {
				'PKG_VERSION': JSON.stringify(pkg_json.version)
			}
		}),
		luamin_loader({include: /\.lua$/})
	],
})