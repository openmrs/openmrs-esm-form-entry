const singleSpaAngularWebpack = require("single-spa-angular/lib/webpack")
  .default;
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
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
  // Feel free to modify this webpack config however you'd like to
  return singleSpaWebpackConfig;
};
