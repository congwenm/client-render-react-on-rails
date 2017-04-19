'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin')

const webpack = require("webpack");
const fs = require('fs') // create fingerprint files so rails can read it

const prod = process.argv.indexOf('-p') !== -1

// hash allows finger printing by webpack
const css_output_template = prod ? 'stylesheets/[name]-[hash].css' : 'stylesheets/[name]-dev.css'
const js_output_template = prod ? 'javascripts/[name]-[hash].js' : 'javascripts/[name]-dev.js'

module.exports = {
  context: __dirname + "/app/assets",

  entry: {
    application: ["./javascripts/application.js", './stylesheets/application.css'],
    contact: ["./javascripts/contact.js", './stylesheets/contact.css'],
  },

  output: {
    path: __dirname + "/public",
    filename: js_output_template,
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015','react']
            }
          }
        ],
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css-loader!sass-loader')
      }
    ]
  },
  // this will handle removing css file into their final resting place
  plugins: [
    new ExtractTextPlugin(css_output_template),

    // write fingerprint to rb file
    function()  {
      this.plugin('done', function(stats) {
        let output = "ASSET_FINGERPRINT = \"" + stats.hash + "\""
        fs.writeFileSync("config/initializers/fingerprint.rb", output, "utf8")
      })
    },

    // delete previous outputs
    function() {
      this.plugin('compile', function() {
        let basepath = __dirname + '/public'
        let paths = ["/javascripts", "/stylesheets"];

        for (let x = 0; x < paths.length; x++) {
          const asset_path = basepath + paths[x];

          fs.readdir(asset_path, function(err, files) {
            if (files === undefined) {
              return;
            }

            for (let i = 0; i < files.length; i++) {
              fs.unlinkSync(asset_path + "/" + files[i]);
            }
          });
        }
      })
    },
  ]
};
