//import {unzlibSync,decompressSync} from 'fflate';
import {unzlibSync,strFromU8} from 'fflate';
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

function getDataString(dv,maxl) {
	var a = [], mb = 0, cp;
	maxl = maxl < dv.byteLength ? maxl : dv.byteLength;
	for (var i=0;i<maxl;i++) {
		var c = dv.getUint8(i);
		if (c == 0) break;
		if (c <= 127) {
			a.push(c);
			mb=0;
		} else if (mb) {
			mb--;
			cp = (cp << 6) | (c&0x3f);
			if (!mb) {
				if (cp & 0x10000) {
					cp -= 0x10000;
					a.push((cp >> 10) + 0xD800,(cp % 0x400) + 0xDC00);
				} else {
					a.push(cp);
				}
			}
		} else if ((cp&0xE0) == 0xC0) { // 110xxxxx
			cp = c & 0x1f;
			mb = 1;
		} else if ((cp&0xF0) == 0xE0) { // 1110xxxx
			cp = c & 0xf;
			mb = 2;
		} else if ((cp&0xF8) == 0xF0) { // 11110xxx
			cp = c & 0x7;
			mb = 3;
		} else {
			a.push('?'.charCodeAt(0));
		}
	}

	return String.fromCharCode.apply(null,a);
}

function readNWCFile(file,into_editbox) {
	var reader = new FileReader();
	reader.onload = function(evt) {
		var buf = evt.target.result;
		var dv = new DataView(buf);
		var hdr = getDataString(dv,8);
		var nwcclip;
		if (hdr == '[NWZ]') {
			var zs = new Uint8Array(buf, 6);
			nwcclip = strFromU8(unzlibSync(zs));
			var hdrStart = nwcclip.indexOf('!NoteWorthyComposer');
			if (hdrStart > 0) nwcclip = nwcclip.substr(hdrStart);
		} else {
			nwcclip = getDataString(dv,256000);
		}

		into_editbox.textContent = nwcclip;
	};
	reader.readAsArrayBuffer(file);
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
		loadnwc: readNWCFile,
		cbResult: false,
		run: nwcRunUserTool
	};
	
	if (!window.NWC) window.NWC = {}
	window.NWC.utlib = jslib;

}

init();