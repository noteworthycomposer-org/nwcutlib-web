--[[-------------------------------------------------------------------------
abcMake.nw.nwcut.lua	Version 0.1

This tool will convert a NWC file to `abc` notation.

$NWCUT$CONFIG: FileText $
--]]-------------------------------------------------------------------------

nwcut.status = nwcut.const.rc_Report

local MAXBARSPERSYS = nwcut.prompt('how many bars per system?','#[2,9999,1]',5)

local abcMap = {
	barMap = {
		Single='|',BrokenSingle='.|',Double='||',BrokenDouble='.||',SectionOpen='[|',SectionClose='|]',
		MasterRepeatOpen='[|:',MasterRepeatClose=':|]',LocalRepeatOpen='|:',LocalRepeatClose=':|',Transparent='[|]'
	},
	clefMap = {percussion='perc'},
	clefOctaveMap = {['Octave Up']='+8',['Octave Down']='-8',['None']=''},
	accMap = {x='^^',['#']='^',n='=',b='_',v='__'},
	accOffsetAccMap = {'b','','#'},
	timesigMap = {Common='C',AllaBreve='C|'},
	durMap = {Whole=1,Half=2,['4th']=4,['8th']=8,['16th']=16,['32nd']=32,['64th']=64},
	tempoBaseMap = {Eighth='1/8',['Eighth Dotted']='1/6',Quarter='1/4',['Quarter Dotted']='1/3',Half='1/2',['Half Dotted']='2/3'},
	flowMap = {
		Coda='!coda!',Segno='!segno!',Fine='!fine!',ToCoda='!dacoda!',DaCapo='!dacapo!',
		DCalCoda='!D.C.alcoda!',DCalFine='!D.C.alfine!',DalSegno='!D.S.!',DSalCoda='!D.S.alcoda!',
		DSalFine='!D.S.alfine!'
	}
}

local function hasValue(v) return (v and (v ~= "")) or false end
local function encloseTable(t,c1,c2)
	table.insert(t,1,c1)
	table.insert(t,c2)
end

local function nextDurItemEndsBar(t,i)
	while t[i] do
		local item = t[i]
		if item:Is('Bar') then return true end
		if item:IsNoteRestChord() then return false end
		i=i+1
	end
	return true
end
		
local function calcDur(item,voice)
	if item:Get('Dur','Grace') then return '' end

	local baseD = item:NoteDurBase(voice)
	local n,d = 1,(abcMap.durMap[baseD] or 4)
	local dots = item:NoteDots(voice)
	if dots > 1 then
		n = n*7
		d = d*4
	elseif dots > 0 then
		n = n*3
		d = d*2
	end

	if n==1 then
		return (d==1) and '' or string.format('/%d',d)
	elseif d==1 then
		return string.format('%d',n)
	end

	return string.format('%d/%d',n,d)
end

local function findFirst(score,t,t2)
	for staffidx,staff in ipairs(score.Staff) do
		for itemindex,item in ipairs(staff.Items) do
			if item:Is(t,t2) then return item end
		end
	end
end

local score = nwcut.loadFile()
local si = score.SongInfo
local firstTempo = findFirst(score,'Tempo')

print('%abc-2.2')
print('% this converter prioritizes abcjs compatibility when possible')
print('% https://noteworthycomposer.org/abcjs')
print('X:1')
print('T:',si:Get('Title') or 'Untitled')
print('C:',si:Get('Author') or 'Anonymous')
print('M:','none')
print('L:','1/1')
if firstTempo then
	local t = firstTempo:GetNum('Tempo')
	if t then
		local b = abcMap.tempoBaseMap[firstTempo:Get('Base') or 'Quarter'] or '1/4'
		print('Q:',string.format('%s=%d',b,t))
	end
end
print('K:','C')
print('% End of header')

for staffidx,staff in ipairs(score.Staff) do
	local staffhdr = staff.AddStaff
	local staffprops = staff.StaffProperties
	local staffinst = staff.StaffInstrument
	local playContext = nwcPlayContext.new()
	local staffPatch = staffinst:GetNum('Patch')

	local notesinbar = 0
	local barsinsys = 0
	local barDur = 1

	if staffprops:Get('Muted')=='Y' then goto continue end

	print(string.format('%%%% %d %s',staffidx,staffhdr:Get('Name')))
	print(string.format('V:%d',staffidx))
	if staffPatch then
		print(string.format('%%%%MIDI program %d',staffPatch))
	end

	for itemindex,item in ipairs(staff.Items) do
		if item:HasDuration() and item:Get('Dur','Slur') and not playContext.Slur then
			nwcut.write('(')
		end

		if item:IsFake() then
			-- don't process these
		elseif item:Is('Rest') then
			local restChar = 'z'
			local dur = calcDur(item)
			notesinbar = notesinbar + 1
			if item:Get('Dur','Triplet') == 'First' then
				nwcut.write('(3')
			elseif (notesinbar == 1) and (dur == '') and nextDurItemEndsBar(staff.Items,itemindex+1) then
				-- this is a whole bar rest
				--restChar = 'Z'
				dur = barDur
			end
			nwcut.write(string.format('%s%s',restChar,dur))
		elseif item:ContainsNotes() then
			local notelist = {}
			local dur = calcDur(item)
			notesinbar = notesinbar + 1
			for notepos in item:AllNotePositions() do
				local courtesy = notepos.CourtesyAcc and '!courtesy!' or ''
				local notename = playContext:GetNoteName(notepos)
				local octave = playContext:GetScientificPitchOctave(notepos) - 4
				local octavestr = (octave == 0) and '' or string.rep((octave < 0) and ',' or '\'',math.abs(octave))
				local acc = playContext:GetNoteAccidental(notepos)
				local tiedOut = notepos.Tied and '-' or ''

				if not notepos.Accidental then courtesy,acc = '','' end

				table.insert(notelist, string.format('%s%s%s%s%s%s',courtesy,abcMap.accMap[acc] or acc,notename,octavestr,dur,tiedOut))
				dur=''
			end
	
			local isMultiNoteChord = #notelist > 1
			local beam = item:Get('Opts','Beam') or 'None'
			
			if (beam == 'First') or (beam == 'None') then nwcut.write(' ') end
			if item:Get('Dur','Triplet') == 'First' then nwcut.write('(3') end

			if item:Get('Dur','Accent') then nwcut.write('!accent!') end
			if item:Get('Dur','Staccato') then nwcut.write('.') end
			if item:Get('Dur','Marcato') then nwcut.write('!marcato!') end

			if isMultiNoteChord then encloseTable(notelist,'[',']') end
			if item:Get('Dur','Grace') then encloseTable(notelist,'{','}') end
			nwcut.write(table.concat(notelist,''))
		elseif item:Is('TimeSig') then
			local sig = tostring(item:Get('Signature')) or 'Common'
			local num,den = sig:match('(%d+)/(%d+)')
			barDur = (num == den) and '1' or sig
			nwcut.write(string.format('[M:%s]',abcMap.timesigMap[sig] or sig))
		elseif item:Is('Bar') then
			local barType = item:Get('Style')
			nwcut.write(string.format(' %s',abcMap.barMap[barType] or '|'))
			if notesinbar > 0 then
				notesinbar = 0
				barsinsys = barsinsys + 1
				if barsinsys >= MAXBARSPERSYS then
					barsinsys = 0
					print()
				else
					nwcut.write(' ')
				end
			end
		elseif item:Is('Clef') then
			local clef = string.lower(item:Get('Type') or 'treble')
			local oshift = item:Get('OctaveShift') or ''
			nwcut.write(string.format('[K: clef=%s%s]',abcMap.clefMap[clef] or clef,abcMap.clefOctaveMap[oshift] or ''))
		elseif item:Is('Key') then
			local tempContext = nwcPlayContext.new()
			local keyTonic = item:Get('Tonic') or 'C'
			tempContext:put(item)
			nwcut.write(string.format('[K:%s%s]',keyTonic,abcMap.accOffsetAccMap[tonumber(tempContext.Key[keyTonic] or 0)+2]))
		elseif item:Is('Ending') then
			local endings = item:Get('Endings')
			if endings then
				local e = {}
				for i=1,8 do if endings[tostring(i)] then table.insert(e,i) end end
				if #e > 0 then nwcut.write(string.format('[%s ',table.concat(e,','))) end
			end
		elseif item:Is('Flow') then
			local flow = abcMap.flowMap[item:Get('Style')]
			if flow then nwcut.write(flow) end
		elseif item:Is('User','ChordPlay.nw') then
			local c = item:Get('Name') or ''
			if c:len() > 0 then
				nwcut.write(string.format('"%s"',c))
			end
		elseif item:Is('User','Arpeggio.ms') then
			if item:Get('Side') ~= 'right' then
				nwcut.write('!arpeggio!')
			end
		end
	
		if item:HasDuration() and playContext.Slur and not item:Get('Dur','Slur') then
			nwcut.write(')')
		end

		playContext:put(item)
	end

	if (notesinbar > 0) or (barsinsys > 0) then
		local endbarType = staff.StaffProperties:Get('EndingBar') or 'SectionClose'
		-- the EndingBar nwctxt property wrongly uses the external interface version of the field, which has spaces
		endbarType = endbarType:gsub(' ','')
		if (notesinbar > 0) then nwcut.write(string.format(' %s',abcMap.barMap[endbarType] or '|')) end
		print()
	end

	::continue::
end
