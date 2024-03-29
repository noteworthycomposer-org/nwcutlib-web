-- Create a `nwcut` environment
local js = require "js"
local window = js.global

return function(input_string)
	-- nwc.exe provides a `gzreadline` global function for loading stdin; we fake it here
	gzreadline = input_string:gmatch("([^\r\n]*)")

	-- utf8string = require('lua-utf8')
	utf8string = string

	nwc = dofile('synthesized-nwc.lua')
	nwcut = {}

	nwcut.status = 0

	nwcut.nwcversion = function()
		return nwc.VERSIONTEXT:sub(8)
	end
		
	nwcut.msgbox = function(msg, msgtitle)
		window:alert(msg)
		return 0
	end

	nwcut.askbox = function(msg, msgtitle, flags)
		local r = window:confirm(msg)
		return r and 1 or -1
	end

	nwcut.prompt = function(msg, datatype, v3, v4)
		local co = assert(coroutine.running())
		local cb = function(mod,retvalue) coroutine.resume(co,retvalue)	end
		window.NWC.utlib:prompt(msg,datatype,v3,v4,cb)
		return coroutine.yield()
	end

	nwcut.clock = os.clock

	dofile('nwcut.lua')

	-- protect the `nwc` tables...this just simulated the behavior in the true env
	for k,v in pairs(nwc.txt) do nwc.txt[k] = nwcut.ProtectTable(v) end
	nwc.txt = nwcut.ProtectTable(nwc.txt)
	nwc = nwcut.ProtectTable(nwc)
end