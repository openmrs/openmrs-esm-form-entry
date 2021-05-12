const singleSpaAngularWebpack = require("single-spa-angular/lib/webpack")
  .default;
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const { StatsWriterPlugin } = require("webpack-stats-plugin");
const packageJson = require("./package.json");

module.exports = (angularWebpackConfig, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(
    angularWebpackConfig,
    options
  );

  for (const dependency of Object.keys(packageJson.peerDependencies)) {
    singleSpaWebpackConfig.externals[dependency] = dependency;
  }

  singleSpaWebpackConfig.plugins.push(new BundleAnalyzerPlugin());
  singleSpaWebpackConfig.plugins.push(new StatsWriterPlugin({
    filename: 'main.js.buildmanifest.json', // TODO: Ideally don't hardcode "main.js".
    stats: {
      all: false,
      chunks: true,
    },
  }));

  console.info(singleSpaWebpackConfig.plugins[singleSpaWebpackConfig.plugins.length - 1]);

  if (singleSpaWebpackConfig.mode === "production") {
    const path = singleSpaWebpackConfig.output.path;
    const publicPath = singleSpaWebpackConfig.output.publicPath;
    // NOTE: this does not work with ng server --prod true, because the file does not exist
    singleSpaWebpackConfig.plugins.push(
      new ReplaceInFileWebpackPlugin([
        {
          dir: path,
          files: ["main-es2015.js"],
          rules: [
            {
              search: "glyphicons-halflings-regular.eot",
              replace: publicPath + "glyphicons-halflings-regular.eot",
            },
            {
              search: "glyphicons-halflings-regular.woff",
              replace: publicPath + "glyphicons-halflings-regular.woff",
            },
            {
              search: "glyphicons-halflings-regular.ttf",
              replace: publicPath + "glyphicons-halflings-regular.ttf",
            },
            {
              search: "glyphicons-halflings-regular.svg",
              replace: publicPath + "glyphicons-halflings-regular.svg",
            },
          ],
        },
      ])
    );
  }

  return singleSpaWebpackConfig;
};
