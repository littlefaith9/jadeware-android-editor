const path = require('path');

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	devServer: {
		port: 8000,
        allowedHosts: 'all',
        static: {                          
            directory: path.join(__dirname, './'),  
            watch: true,
        },
		devMiddleware: {
			stats: 'minimal',
		},
	},
	output: {
		path: __dirname,
		filename: './index.js',
        publicPath: '/'
	},
	module: {
		rules: [{ test: /\.ts/, loader: 'ts-loader' }]
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
};