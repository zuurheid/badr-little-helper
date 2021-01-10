const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    'parser.js': './src/index.ts',
    'parser.min.js': './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, '_bundles'),
      filename: '[name]',
      libraryTarget: 'umd',
      library: 'parser',
      umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader" }
    ]
  }
}

