const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const NODE_ENV = process.env.NODE_ENV;

const modeDevelopment = "development";
const modeProduction = "production";

const mode = NODE_ENV === modeDevelopment ? modeDevelopment : modeProduction;

var config = {
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  mode,
  entry: path.resolve(__dirname, "src/index.tsx"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        exclude: [/node_modules/],
        use: ["ts-loader"],
      },
      {
        test: /\.(s*)css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                mode: "local",
                localIdentName: "[name]__[local]__[hash:base64:5]",
                auto: /\.module\.\w+$/i,
              },
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
    }),
  ],
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
  },
};

module.exports = (_, __) => {
  if (mode === modeDevelopment) {
    config.devtool = "source-map";
  }
  return config;
};
