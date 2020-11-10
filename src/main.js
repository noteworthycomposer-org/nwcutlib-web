import {nwcRunUserTool} from './nwcutlib.lua-js';

function init() {
	let jslib = {
		version: VERSION,
		run: nwcRunUserTool
	};
	
	if (!window.NWC) window.NWC = {}
	window.NWC.utlib = jslib;
}

init();