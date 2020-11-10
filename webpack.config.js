const webpack = require('webpack');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const pkg_json = require('./package.json');

module.exports = {
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'nwcutlib.js'
	},
	module: {
		rules: [
			{
				test: /\.lua-js$/,
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
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(pkg_json.version)
		}),
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
