const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');

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
				test: /\.(abc|nwctxt|txt)$/,
				use: [
					{ loader: 'raw-loader', options: {esModule: false} }
				]
			},
			{
				test: /\.lua$/,
				use: [
					{ loader: 'raw-loader', options: {esModule: false} },
					{ loader: path.resolve('./loader/luamin.js') }
				]
			}
		]
	},
	plugins: [
		new CompressionPlugin({
			test: /\.(css|js|html)$/i,
		})
	],
	devServer: {
		contentBase: path.join(__dirname, 'public'),
		//compress: true,
		//disableHostCheck: true,
		index: 'index.html'
	}
}
