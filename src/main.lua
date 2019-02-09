abcjs = require("abcjs/midi")

nwcut = {}
nwc = {VERSION='2.75',VERSIONDATE='20161231',VERSIONKEY='2.75a.beta.009',VERSIONTEXT='Version 2.75a Beta 9'}
nwc.txt = {}

local function runUserTool()
	local nwcutlib = require('nwcutlib/nwcut.lua')
end

local doc = js.global.document

local abctxtSample = [[
%abc-2.2
% this converter prioritizes abcjs compatibility when possible
% https://noteworthycomposer.org/abcjs
X:1
T:	
C:	
M:	none
L:	1/1
Q:	1/4=60
K:	C
% End of header
%% 1 Staff
V:1
[K: clef=treble][K:G] G/8A/16B/16 C'/16D'/16E'/16F'/16 |  G'/8F'/16E'/16 D'/16C'/16B/16A/16 |  G/2 |  (3G/8B/8D'/8 (3G'/8D'/8B/8 |  G/2 |]
]]

--abcjs.midi.setSoundFont("https://noteworthycomposer.org/z/FluidR3_GM/")

local function docmods()
	local h1 = doc:getElementById('maintitle')
	local h2 = doc:getElementById('subtitle')

	local function addDiv(id)
		local newdiv = doc:createElement('div')
		newdiv.id = id
		doc.body:appendChild(newdiv)
	end
	
	h1.innerHTML = '<i class="fa fa-music"></i> nwc2abc'
	h2.innerHTML = 'Convert any recent nwc text clip into abc notation'
	
	local newp = doc:createElement('p')
	newp.innerHTML = '<button id="btnUpdate">Update</button><button id="btnLoadUT">Load UT</button><textarea id="intextbox" cols="80" rows="15" style="width:100%">'
	doc.body:appendChild(newp)

	addDiv('abcMidi')
	addDiv('abcCanvas')
	addDiv('warningsBox')

	doc:getElementById('intextbox').value = abctxtSample
end

docmods()

doc:getElementById('btnUpdate'):addEventListener('click', function(p1,p2)
	print('click',type(p2),js.typeof(p2))
	local intextbox = doc:getElementById('intextbox')
	local abctxt = intextbox.value
	print('tune count',abcjs:numberOfTunes(abctxt))

	print('calling abcjs.renderAbc')
	abcjs:renderAbc('abcCanvas', abctxt)
	abcjs:renderMidi('abcMidi', abctxt)
end)

doc:getElementById('btnLoadUT'):addEventListener('click', function()
	print('loading user tool library')
	runUserTool()
end)

local function getSafeString(s)
	return (type(s) == 'string') and s or ''
end

local nwc2abc =  {
	version = 0.1,
	test = function(s0,s1,s2,s3,s4)
		print('inside TestLuaRun',type(s0),getSafeString(s0),s1,s2,s3,s4)
		return 'string inside Lua back to js'
	end,
	add = function(s0,s1)
		print('called lua AddParagraph')
		local newp = doc:createElement('p')
		newp.innerHTML = ('boo-hoo %s'):format(s1)
		doc.body:appendChild(newp)
	end
}

js.global.nwc2abc = js.createproxy(nwc2abc,'object')
