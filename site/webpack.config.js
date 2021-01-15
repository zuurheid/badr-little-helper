const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const NODE_ENV = process.env.NODE_ENV;

const modeDevelopment = "development";
const modeStaging = "staging";
const modeProduction = "production";

const mode = NODE_ENV === modeDevelopment ? modeDevelopment : modeProduction;
const publicPath =
  NODE_ENV === modeProduction
    ? "https://zuurheid.github.io/badr-little-helper"
    : NODE_ENV === modeStaging
    ? "https://zuurheid.github.io/staging-badr-little-helper"
    : "auto";
const baseUrl =
  NODE_ENV === modeProduction
    ? "https://zuurheid.github.io/badr-little-helper/"
    : NODE_ENV === modeStaging
    ? "https://zuurheid.github.io/staging-badr-little-helper/"
    : "/";

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
      favicon: path.resolve(__dirname, "public/favicon.ico"),
      template: path.resolve(__dirname, "public/index.html"),
      publicPath,
      baseUrl,
    }),
    new webpack.DefinePlugin({
      _BASE_URL_: JSON.stringify(baseUrl),
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public/locales", to: "locales" }],
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
