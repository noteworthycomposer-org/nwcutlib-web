const luamin = require('luamin');

module.exports.raw = true;

module.exports = function(source) {
	return luamin.minify(source);
};
