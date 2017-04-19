'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin')

const webpack = require("webpack");
const fs = require('fs') // create fingerprint files so rails can read it

module.exports = {
  context: __dirname + "/app/assets/javascripts",

  entry: {
    application: "./application.js",
  },

  output: {
    path: __dirname + "/public",
    filename: "javascripts/[name]-[hash].js", // hash allows finger printing by webpack
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015']
            }
          }
        ],
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css!sass')
      }
    ]
  },
  // this will handle removing css file into their final resting place
  plugins: [
    new ExtractTextPlugin('stylesheets/[name]-[hash].css'),

    function()  {
      this.plugin('done', function(stats) {
        let output = "ASSET_FINGERPRINT = \"" + stats.hash + "\""
        fs.writeFileSync("config/initializers/fingerprint.rb", output, "utf8")
      })
    },
  ]
};
