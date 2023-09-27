const fs = require('fs')
const gzipme = require('gzipme')

const outFilename = 'public/nwcutlib.js'
const gzoutFilename = `${outFilename}.gz`

gzipme(outFilename, {mode:'best', output: gzoutFilename}).then(() => {
	fs.stat(outFilename, (err, stats) => {
		if (err) console.log('failed to stat')
		else {
			fs.utimesSync(gzoutFilename, stats.atime, stats.mtime);
			console.log(`created ${gzoutFilename} and set mtime to ${stats.mtime}`)
		}
	})
})
