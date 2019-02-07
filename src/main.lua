local doc = js.global.document
local h1 = doc:getElementById('maintitle')
local h2 = doc:getElementById('subtitle')

h1.innerHTML = 'replaced!'
local newp = doc:createElement('p')
newp.innerHTML = 'A new paragraph'
doc.body:appendChild(newp)
