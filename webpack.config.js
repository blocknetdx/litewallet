const _ = require('lodash');
const path = require('path');

const appDir = path.resolve(__dirname, 'src/app');
const destDir = path.resolve(__dirname, 'dist/app');

const common = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          appDir
        ],
        exclude: [],
        use: {
          loader: 'babel-loader'
        }
      },
    ]
  },
  resolve: {
    modules: [
      'node_modules',
      appDir
    ],
    extensions: ['.js', '.json', '.jsx'],
  },
  watchOptions: {
    aggregateTimeout: 2000,
    poll: 1000,
    ignored: [
      /src\/(?!app)\/*/, // only rebuild changes to src/app
      'node_modules/**',
    ],
  },
  devtool: 'source-map',
  context: __dirname
};

const errorjs = {
  name: 'errorjs',
  entry: './src/app/error.js',
  output: {
    path: destDir,
    filename: 'error.js',
    sourceMapFilename: '[file].map', // string
    libraryTarget: 'umd'
  },
  target: 'web'
};

const mainjs = {
  name: 'mainjs',
  entry: './src/app/main.js',
  output: {
    path: destDir,
    filename: 'main.js',
    sourceMapFilename: '[file].map', // string
    libraryTarget: 'umd'
  },
  target: 'web',
  optimization: {
    minimize: false
  }
};

_.merge(errorjs, common);
_.merge(mainjs, common);

module.exports = (env, argv) => {
  if (!argv.mode)
    argv.mode = process.env.NODE_ENV || 'development';
  mainjs.mode = argv.mode;
  errorjs.mode = argv.mode;
  return [mainjs, errorjs];
};
