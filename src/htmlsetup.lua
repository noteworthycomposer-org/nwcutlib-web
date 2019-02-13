local htmlsetup = {}
function htmlsetup.docmods(doc,abcjs)
	local h1 = doc:getElementById('maintitle')
	local h2 = doc:getElementById('subtitle')

	local function addDiv(id)
		local newdiv = doc:createElement('div')
		newdiv.id = id
		doc.body:appendChild(newdiv)
	end
	
	--abcjs.midi:setSoundFont("https://noteworthycomposer.org/z/FluidR3_GM/")

	h1.innerHTML = '<i class="fa fa-music"></i> nwc2abc'
	h2.innerHTML = 'Convert any recent nwc text clip into abc notation'
	
	local newp = doc:createElement('p')
	newp.innerHTML = '<button id="btnUpdate">Update</button><button id="btnNWC2ABC">Run nwc2abc</button><textarea id="intextbox" cols="80" rows="15" style="width:100%">'
	doc.body:appendChild(newp)

	addDiv('abcMidi')
	addDiv('abcCanvas')
	addDiv('warningsBox')
end

return htmlsetup