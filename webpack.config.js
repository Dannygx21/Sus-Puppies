const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'eval-source-map' : false,
  entry: path.resolve(__dirname, './src/index.jsx'),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(jpg|jpeg|gif|png|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },
      {
        test: /\.(mp3|wav)$/,
        type: 'asset/resource',
        generator: {
          filename: 'sounds/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'bundle.js',
  },
  optimization: isDev ? {} : {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
        },
      }),
    ],
  },
};
