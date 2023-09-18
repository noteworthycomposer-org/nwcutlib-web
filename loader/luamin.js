const fs = require('fs');
const luamin = require('luamin');

exports.luamin = (options = {}) => {
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

module.exports = exports;
