local NWOutStream = {ID='NWOutStream'}
NWOutStream.__index = NWOutStream

function NWOutStream.new(...)
	local o = {t={}}
	setmetatable(o,NWOutStream)
	return o
end

function NWOutStream:reset()
	for k in pairs (self.t) do
		self.t[k] = nil
	end
end

function NWOutStream:write(...)
	local a = {...}
	for i = 1, #a do table.insert(self.t,tostring(a[i])) end
end

function NWOutStream:writeln(...)
	self:write(...)
	self:write('\n')
end

function NWOutStream:__tostring()
	return table.concat(self.t)
end

return NWOutStream