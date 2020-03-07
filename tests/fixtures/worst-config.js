// A config file in which everything is wrong
module.exports = {
  type: 'invalid',
  polyfill: 45,
  invalidTopLevelConfig: true,
  moreInvalidTopLevelConfig: true,
  babel: {
    invalidBabelConfig: true,
    cherryPick: 45,
    env: 45,
    loose: 45,
    plugins: 45,
    proposals: 45,
    presets: 45,
    removePropTypes: 45,
    reactConstantElements: 45,
    runtime: 45,
    // TODO Remove - deprecated
    stage: 45,
    config: 45
  },
  devServer: 45,
  karma: {
    invalidKarmaConfig: true,
    browsers: 45,
    excludeFromCoverage: 45,
    frameworks: 45,
    plugins: 45,
    reporters: 45,
    testContext: 45,
    testFiles: 45,
    extra: 45,
    config: 45
  },
  npm: {
    invalidNpmBuildConfig: true,
    cjs: 45,
    esModules: 45,
    umd: {
      invalidUMDConfig: true,
      global: 45,
      externals: 45,
    }
  },
  webpack: {
    invalidWebpackConfig: true,
    moreInvalidWebpackConfig: true,
    aliases: 45,
    autoprefixer: 45,
    compat: {
      invalidCompatConfig: true,
      intl: 45,
      moment: 45,
      'react-intl': 45,
    },
    copy: 45,
    debug: 45,
    define: 45,
    extractCSS: 45,
    html: 45,
    install: 45,
    publicPath: 45,
    rules: 45,
    styles: 45,
    terser: 45,
    extra: 45,
    config: 45,
  }
}
