const path = require('path');
const webpack = require('webpack');

// quality of life
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
// builders
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');

// TODO: integrate cleancss,uglifyjs etc.
// TODO: url-loader for images / responsive-loader for big images

// Reliably detect devmode
const devMode = !(
  process.env.NODE_ENV === 'production' ||
  process.argv[process.argv.indexOf('--mode') + 1] === 'production' ||
  process.argv[process.argv.indexOf('--mode=production')] ===
    '--mode=production'
);

devMode
  ? console.log('DEVELOPMENT MODE BUILD')
  : console.log('PRODUCTION BUILD');

process.env.NODE_ENV = devMode ? '"development"' : '"production"';

// Default project_config loading to use the production config. Which will break for everything non-prod.
const projectConfigFile = process.env.MARKETPLACE_PROJECT_CONFIG_FILE
  ? process.env.MARKETPLACE_PROJECT_CONFIG_FILE
  : './project_configs/dev.json';

console.log('Using project config file: ' + projectConfigFile);

const projectConfig = require(projectConfigFile);

module.exports = {
  devtool: devMode ? 'inline-source-map' : 'source-map',
  devServer: {
    // Both these don't work properly with the dev-server.
    //hot: true,
    //hotOnly: false,
    inline: true,
    publicPath: '/',
    stats: {
      colors: true
    },
    // HACK: we might like to narrow the scope here, but developers probably aren't trying
    // to script-inject themselves maliciously. This is so we can hookup to remote backends.
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization'
    }
  },
  entry: {
    main: ['./src/index.js'],
    vendor: ['react', 'firebase', 'jquery']
  },
  output: {
    path: path.resolve('./dist/'),
    filename: 'static/[name].[contenthash].js',
    sourceMapFilename: 'static/[name].[contenthash].map',
    publicPath: '/'
  },
  resolve: {
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new CleanWebpackPlugin(['dist/*'], {
      verbose: true,
      watch: true
    }),
    new webpack.DefinePlugin({
      MARKETPLACE_PROJECT_CONFIG: JSON.stringify({
        endpoints: projectConfig.endpoints,
        firebase: projectConfig.firebase
      })
    }),
    new ExtraWatchWebpackPlugin({
      files: ['src/**/*.json', 'src/**/*.ejs']
      //dirs: [ 'path/to/dir' ],
    }),
    new ExtractCssChunks({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode
        ? 'static/[name].css'
        : 'static/[name].[contenthash].css',
      chunkFilename: devMode
        ? 'static/[id].css'
        : 'static/[id].[contenthash].css',
      hot: devMode ? true : false
    }),
    new HtmlWebpackPlugin({
      //hash: true, // disabled because we use content-hashes in filenames to cache bust
      inject: false, // false because EJS handles script injection
      minify: devMode
        ? false
        : {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          },
      template: '!!ejs-compiled-loader-webpack4!src/index.ejs'
    }),
    new CopyWebpackPlugin([{ from: 'app.yaml', to: './', force: true }])
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules\/(?!pluto-common-npm-package)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          ExtractCssChunks.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true }
          },
          {
            loader: 'postcss-loader',
            options: { sourceMap: true }
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: true }
          }
        ]
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader:
          'url-loader?name=static/[name]-[hash].[ext]&limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader:
          'url-loader?name=static/[name]-[hash].[ext]&limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?name=static/[name]-[hash].[ext]'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader:
          'url-loader?name=static/[name]-[hash].[ext]&limit=10000&mimetype=image/svg+xml'
      },
      {
        test: /\.(png|jpe?g)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'static/[name]-[hash].[ext]',
              fallback: 'responsive-loader'
            }
          }
        ]
      },
      {
        // Special handling for gif's because we solely use them for AJAX
        // loading images, which should be on the page when it loads.
        test: /\.(gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'static/[name]-[hash].[ext]'
            }
          }
        ]
      }
    ]
  }
};
