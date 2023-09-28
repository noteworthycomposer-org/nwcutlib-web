local js = require "js"
local window = js.global

return function(luaPreloads)
	--luaPreloads is a table of preloaded Lua files, keyed by their file path
	local fengary_loadfile = loadfile
	local fengary_dofile = dofile
	local fengary_print = print
	local smart_loadfile = function(filename,mode,env)
		local m = luaPreloads[filename]
		if not m then return fengary_loadfile(filename,mode,env) end
		-- avoid creating a nil default environment
		return env and load(m,filename,mode,env) or load(m,filename,mode)
	end

	loadfile = smart_loadfile
	dofile = function(f)
		if luaPreloads[f] then
			local m = smart_loadfile(f)
			return m and m() or nil
		end

		return fengary_dofile(f)
	end

	local NWOutStream = smart_loadfile('outstream')()

	local function runUserTool(mod,intxt,...)
		arg = {...}
		intxt = tostring(intxt) or ''
		local io_stdout = NWOutStream.new()
		local io_stderr = NWOutStream.new()
		local function stdout_writer(...) io_stdout:write(...) end
		io = {write=stdout_writer,stdout=io_stdout,stderr=io_stderr}
		print = function(...) io_stdout:writeln(...) end

		local doExecuteTool = function()
			dofile('synthesize.lua')(intxt)
			nwcut.run(arg[1])
		end
		local good,failmsg = pcall(doExecuteTool)
		if not good then
			nwcut.status = 1
			io_stderr:writeln('A run-time error was detected')
			io_stderr:writeln(failmsg)
		end

		print = fengary_print
		return {
			status=nwcut.status,
			output=js.tostring(io_stdout),
			error=js.tostring(io_stderr)
		}
	end

	local nwcRunUserTool = function(mod,tool,nwctxt,...)
		coroutine.wrap(function(mod,tool,nwctxt,...)
			local r = runUserTool(mod,nwctxt,tool,...)
			window.NWC.utlib:cbResult(js.createproxy(r,'object'))
		end)(mod,tool,nwctxt,...)
	end

	return js.createproxy(nwcRunUserTool,'function')
end
