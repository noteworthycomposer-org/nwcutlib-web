import {L,lua,lauxlib,interop,to_luastring} from 'fengari-web/src/fengari-web';
import {nwcut_prompt,nwcut_prompt_promise} from './nwcut_prompt';
import lua_js2nwcutlib from './lua/js2nwcut.lua';
import lua_outstream from './lua/outstream.lua';
import lua_synthesized_nwc from 'nwcutlib/synthesized-nwc.lua';
import lua_synthesize from './lua/nwcut.lua';
import lua_simulation from 'nwcutlib/simulation.lua';
import lua_nwcut from 'nwcutlib/nwcut.lua';

const {LUA_OK,LUA_ERRSYNTAX,lua_createtable,lua_gettop,lua_pcall,lua_pop,lua_pushcfunction,lua_pushvalue,
	lua_pushliteral,lua_setfield,lua_tostring,lua_tojsstring,lua_type} = lua;
const {luaL_loadbuffer} = lauxlib;
const {tojs} = interop;

async function uprompt(msg,  datatype, listvals, defaultval) {
	return await nwcut_prompt_promise(msg,  datatype, listvals, defaultval);
}

function init() {
	// the approach here is to bundle all of the nwcutlib Lua files, then set them up as a preload
	// passed to the js2nwcutlib.lua init file. It then handles the rest from the Lua side.
	function lua_preload(name,source) {
		lua_pushliteral(L, source);
    	lua_setfield(L, -2, to_luastring(name));
	}
	
	let ok = luaL_loadbuffer(L, to_luastring(lua_js2nwcutlib), null, to_luastring('js2nwcutlib.lua'));
	if (ok !== LUA_OK) {
		if (ok === LUA_ERRSYNTAX) throw new SyntaxError(lua_tojsstring(L, -1));
		else throw tojs(L, -1);
	}
	if (lua_pcall(L, 0, 1, 0) != LUA_OK) throw tojs(L, -1);
	// init function is now at the top of the stack
	lua_createtable(L);
	lua_preload('outstream',lua_outstream);
	lua_preload('synthesized-nwc.lua',lua_synthesized_nwc);
	lua_preload('synthesize.lua',lua_synthesize);
	lua_preload('simulation.lua',lua_simulation);
	lua_preload('nwcut.lua',lua_nwcut);

	if (lua_pcall(L, 1, 1, 0) != LUA_OK) console.log(tojs(L, -1),'Error');
	let nwcRunUserTool = tojs(L, -1);
	lua_pop(L, 1);

	let jslib = {
		version: PKG_VERSION,
		prompt: nwcut_prompt,
		cbResult: false,
		run: nwcRunUserTool
	};
	
	if (!window.NWC) window.NWC = {}
	window.NWC.utlib = jslib;
}

init();