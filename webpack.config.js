const path = require('path');

module.exports = {
	entry: './src/main.lua',
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'nwc2abc.js'
	},
	module: {
		rules: [
			{
				test: /\.lua$/,
				use: [
					{ loader: "fengari-loader" }
				]
			}
		]
	},
	devServer: {
		contentBase: path.join(__dirname, 'public'),
		//compress: true,
		//disableHostCheck: true,
		index: 'index.html'
	}
}
