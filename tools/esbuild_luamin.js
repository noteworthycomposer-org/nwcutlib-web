// Use this to minify a Lua file in esbuild

const fs = require('fs');
const luamin = require('luamin');

module.exports = (options = {}) => {
	return {
		name: 'esbuild_luamin',
		setup(build) {
			build.onLoad({ filter: options.include }, async (args) => {
				const source = await fs.promises.readFile(args.path, "utf8");
				const contents = luamin.minify(source);
				return { contents, loader: 'default' };				
			});
		}
	}
}
