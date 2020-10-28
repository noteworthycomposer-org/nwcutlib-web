import {nwcRunUserTool} from './nwcutlib.lua-web';

function init() {
	let jslib = {
		version: VERSION,
		run: nwcRunUserTool
	};
	
	if (!window.NWC) window.NWC = {}
	window.NWC.utlib = jslib;
}

init();