const fs = require('fs');
const { build } = require('esbuild');
const luamin = require('luamin');
const gzipme = require('gzipme');
const pkg_json = require('./package.json');

function escRegExp(s) {return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");}

// The esbuild define in its current form cannot handle the replacements required by Fengari,
// so we use this custom plugin instead. This converts string matches to a regex that only
// matches the string when surrounded by word boundaries. This should sufficiently emulate
// the webpack.DefinePlugin behaviour.
let replace = (options = {}) => {
	const d = options.define;
	let r = [];
	for(const k in d) {
		r.push(new RegExp('\\b'+escRegExp(k)+'\\b','g'),d[k]);
	}

	return {
		name: 'replace',
		setup(build) {
			build.onLoad({ filter: options.include }, async (args) => {
				let contents = await fs.promises.readFile(args.path, 'utf8');
				for(let i=0; i < r.length; i+=2) {
					contents = contents.replaceAll(r[i],r[i+1]);
				}
				return { contents, loader: 'default' };				
			});
		}
	}
}

// Use this to minify a Lua file
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
		replace({
			include: /\b(fengari|fengari-interop).+\.js$/,
			define: {
				'process.env.FENGARICONF': 'void 0',
				'typeof process': JSON.stringify('undefined')
			}
		}),
		replace({
			include: /\bmain\.js$/,
			define: {
				'PKG_VERSION': JSON.stringify(pkg_json.version)
			}
		}),
		luamin_loader({include: /\.lua$/})
	],
})

gzipme(outFilename, {mode:'best', output: `${outFilename}.gz`});
