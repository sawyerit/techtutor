const HtmlWebpackPlugin = require("html-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        entry: {
          main: [
            env === "development" &&
            require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs,
          ].filter(Boolean),
          background: paths.appSrc + "/chrome-services/background.ts",
          float: paths.appSrc + "/chrome-services/float.ts",
        },
        output: {
          ...webpackConfig.output,
          filename: "static/js/[name].js",
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
        },
        plugins: [
          ...webpackConfig.plugins,
          new HtmlWebpackPlugin({
            inject: true,
            chunks: ["options"],
            template: paths.appHtml,
            filename: "options.html",
          }),
          new CopyPlugin({
            patterns: [
              {
                from: '**/*.*', to: '.', context: 'public', globOptions: {
                  dot: true,
                  gitignore: true,
                  ignore: ["**/index.html"],
                },
              },
              {
                from: paths.appSrc + '/chrome-services/float.css', // Source path of your CSS file
                to: 'static/css/float.css', // Destination path in the output folder
              },
              {
                from: paths.appSrc + '/chrome-services/skill.css', // Source path of your CSS file
                to: 'static/css/skill.css', // Destination path in the output folder
              },
            ]
          }),
          new ZipPlugin({
            path: '../', // don't save the zip file inside the build directory
            filename: 'release.zip',
            extension: 'zip',
          })
        ],
      };
    },
  },
};