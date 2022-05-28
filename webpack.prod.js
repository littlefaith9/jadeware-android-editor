const TerserPlugin= require('terser-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: './src/index.ts',
	output: {
		path: __dirname,
		filename: './index.js',
	},
	module: {
		rules: [{ test: /\.ts/, loader: 'ts-loader' }]
	},
	resolve: {
		extensions: ['.ts']
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin({
			terserOptions: {
				format: {
					comments: false,
				}
			},
			extractComments: false,
		})]
	},
}