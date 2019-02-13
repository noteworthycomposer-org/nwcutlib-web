const path = require('path');

module.exports = {
	entry: './src/main.jslua',
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'nwc2abc.js'
	},
	module: {
		rules: [
			{
				test: /\.jslua$/,
				use: [
					{
						loader: "fengari-loader",
						options: { strip: false }
					},
					{ loader: path.resolve('./loader/luamin.js') }
				]
			},
			{
				test: /\.(txt|abc)$/,
				use: 'raw-loader'
			},
			{
				test: /\.lua$/,
				use: [
					{ loader: 'raw-loader' },
					{ loader: path.resolve('./loader/luamin.js') }
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
