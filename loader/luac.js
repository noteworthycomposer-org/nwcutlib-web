// This loader compiles and loads a Lua module using Fengari.
// The loaded module is not executed. The resulting Lua function
// can be executed with `xpcall` in the Lua environment.

const {
	luastring_eq,
	to_jsstring,
	to_luastring,
	lua: {
		LUA_ERRSYNTAX,
		lua_dump,
		lua_pop,
		lua_tojsstring,
		lua_tostring
	},
	lauxlib: {
		luaL_Buffer,
		luaL_addlstring,
		luaL_buffinit,
		luaL_loadbuffer,
		luaL_newstate,
		luaL_pushresult
	}
} = require('fengari');

const loader_utils = require('loader-utils');
module.exports.raw = true;

module.exports = function(source) {
	if (typeof source === 'string') {
		source = to_luastring(source);
	} else if (!(source instanceof Uint8Array)) {
		let buf = new Uint8Array(source.length);
		source.copy(buf);
		source = buf;
	}

	let L = luaL_newstate();
	if (luaL_loadbuffer(L, source, null, null) === LUA_ERRSYNTAX) {
		let msg = lua_tojsstring(L, -1);
		throw new SyntaxError(msg);
	}

	const writer = function(L, b, size, B) {
		luaL_addlstring(B, b, size);
		return 0;
	};

	let b = new luaL_Buffer();
	luaL_buffinit(L, b);
	if (lua_dump(L, writer, b, true) !== 0) throw new Error('unable to dump given function');
	luaL_pushresult(b);
	source = lua_tostring(L, -1);
	source = 'fengari_web.luastring_of(' + source.join(',') + ')';
	lua_pop(L, 1);

	let dependson = 'var fengari_web = require("fengari-web");\n';
	let chunkname = '"@"+' + loader_utils.stringifyRequest(this, this.resourcePath);

	return dependson + `module.exports = fengari_web.load(${source},${chunkname});`;
};
