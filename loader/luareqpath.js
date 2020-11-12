// This loader fixes up any lua require that uses a relative folder '.' prefix.
// The fengari-loader will then properly include them in the bundle. Note that
// this fixup changes what will appear in lauxlib.LUA_PRELOAD_TABLE, so you need
// to be aware of this.
const process = require('process');
const path = require('path');

function toPosixPath(pathstring) { return pathstring.split(path.sep).join(path.posix.sep); }

module.exports.raw = true;

module.exports = function(source) {
	source = source.replace(/(\brequire[\( \t\r\n]+["'])([^'"]+)/g, (match,p1,p2) => {
		if (p2[0] == '.') {
			let repath = path.posix.relative(toPosixPath(process.cwd()), toPosixPath(this.context));
			return p1+'./'+path.posix.join(repath, p2);
		}

		return match;
	});

	return source;
};
