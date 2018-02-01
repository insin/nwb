# 0.21.5 / 2018-02-02

## Dependencies

- cross-spawn: v6.0.3 → [v6.0.4](https://github.com/moxystudio/node-cross-spawn/blob/master/CHANGELOG.md#604-2018-01-31)

# 0.21.4 / 2018-01-30

## Fixed

- Fixed validation of `webpack.compat` locale properties [[#425](https://github.com/insin/nwb/issues/425)]
- Fixed false negative when checking if the port is available when `devServer.port` is specified as a `String` [[#423](https://github.com/insin/nwb/issues/423)]

## Dependencies

- uglifyjs-webpack-plugin: v1.1.6 → [v1.1.8](https://github.com/webpack-contrib/uglifyjs-webpack-plugin/blob/master/CHANGELOG.md#118-2018-01-29) - reduce memory consumption

# 0.21.3 / 2018-01-28

## Changed

- `port` config in [`devServer` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#devserver-object) will now be used if configured [[#423](https://github.com/insin/nwb/issues/423)]

## Dependencies

- cross-spawn: v5.1.0 → [v6.0.3](https://github.com/moxystudio/node-cross-spawn/blob/master/CHANGELOG.md#603-2018-01-23)
- css-loader: v0.28.7 → [v0.28.9](https://github.com/webpack-contrib/css-loader/blob/master/CHANGELOG.md#0289-2018-01-17)
- style-loader: v0.19.1 → [v0.20.1](https://github.com/webpack-contrib/style-loader/blob/master/CHANGELOG.md#0201-2018-01-26)

# 0.21.2 / 2018-01-17

## Fixed

- Fixed validation of `babel.env` config [[#420](https://github.com/insin/nwb/issues/420)] [[ngyikp][ngyikp]]

## Dependencies

- autoprefixer: v7.2.4 → [v7.2.5](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#725)
- opn: v5.1.0 → [v5.2.0](https://github.com/sindresorhus/opn/compare/v5.1.0...v5.2.0)
- semver: v5.4.1 → [v5.5.0](https://github.com/npm/node-semver/compare/v5.4.1...v5.5.0)

# 0.21.1 / 2018-01-12

## Fixed

- Fixed validation of `webpack.extractText = false` config, which disables extraction of imported stylesheets into `.css` files [[#418](https://github.com/insin/nwb/issues/418)]

## Dependencies

- postcss-loader: v2.0.9 → [v2.0.10](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#2010-2018-01-03)
- uglifyjs-webpack-plugin: v1.1.5 → [v1.1.6](https://github.com/webpack-contrib/uglifyjs-webpack-plugin/releases/tag/v1.1.6)

# 0.21.0 / 2018-01-03

## Breaking Changes

- Validation of the configuration object provided by `nwb.config.js` files has been expanded, so previously valid config files may now be invalid [[#136](https://github.com/insin/nwb/issues/136)]
  - Unexpected properties in top-level configuration or in `babel`, `karma`, `npm` and `webpack` configuration (i.e. anything that's not documented in the [Configuration docs](https://github.com/insin/nwb/blob/master/docs/Configuration.md)) are now treated as errors [[#193](https://github.com/insin/nwb/issues/193)]
  - Basic type checking is now performed for all documented configuration properties.
  - After upgrading, run `nwb check-config` to check your configuration file.
- Updated to [UglifyJSPlugin 1.x](https://github.com/webpack-contrib/uglifyjs-webpack-plugin#readme), which supports ES2015 syntax and adds options to enable filesystem caching and use multiple processes to improve build speed, which nwb enables by default [[#412](https://github.com/insin/nwb/issues/412)]
  - Review any custom [`webpack.uglify` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#uglify-object--false) you have against the new version's [options documentation](https://github.com/webpack-contrib/uglifyjs-webpack-plugin#options) - options for UglifyJS itself must now be passed as an `uglifyOptions` object and some of UglifyJS' default options have changed.
- Node.js 4.8.0 is now the minimum required version, based on the `engines` config of nwb's dependencies.

## `nwb.config.js` Config Changes

- Deprecated the `webpack.compat.sinon` flag for Sinon 1.x compatibility settings, as subsequent major versions since July 2017 support Webpack out of the box.

## Fixed

- Fixed testing React component/library and web module projects when using [export extensions](http://babeljs.io/docs/plugins/transform-export-extensions/) - the Babel stage preset wasn't being defaulted to preset-stage-1, which includes the export extensions plugin [[#364](https://github.com/insin/nwb/issues/364)]

## Added

- Added an [`--open` flag](https://github.com/insin/nwb/blob/master/docs/Commands.md#options) to open the app in your default browser or in a named browser (e.g. `--open="Google Chrome"`) after starting a Webpack dev server [[#334](https://github.com/insin/nwb/issues/334)]
- You can now provide a [`babel.config()` function](https://github.com/insin/nwb/blob/master/docs/Configuration.md#config-function) which will be given the generated Babel config to do whatever it wants with.
- You can now provide a [`karma.config()` function](https://github.com/insin/nwb/blob/master/docs/Configuration.md#config-function-2) which will be given the generated Karma config to do whatever it wants with [[#408](https://github.com/insin/nwb/issues/408)]

## Changed

- Simplified configuration of locales in [`webpack.compat` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#compat-object)

## Dependencies

- autoprefixer: v7.1.6 → [v7.2.4](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#724)
- babel-plugin-inferno: v3.3.0 → [v3.3.1](https://github.com/infernojs/babel-plugin-inferno/releases)
- copy-webpack-plugin: v4.2.1 → [v4.3.1](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#431-2017-12-22)
- file-loader: v1.1.5 → [v1.1.6](https://github.com/webpack-contrib/file-loader/blob/master/CHANGELOG.md#116-2017-12-16)
- gzip-size: v4.0.0 → [v4.1.0](https://github.com/sindresorhus/gzip-size/compare/v4.0.0...v4.1.0)
- karma: v1.7.1 → [v2.0.0](https://github.com/karma-runner/karma/releases/tag/v2.0.0)
- karma-webpack: v2.0.6 → [v2.0.9](https://github.com/webpack-contrib/karma-webpack/blob/master/CHANGELOG.md#209-2017-12-14)
- mocha: v4.0.1 → [v4.1.0](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#410--2017-12-28)
- postcss-loader: v2.0.8 → [v2.0.9](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#209-2017-11-24)
- style-loader: v0.19.0 → [v0.19.1](https://github.com/webpack-contrib/style-loader/blob/master/CHANGELOG.md#0191-2017-12-14)
- webpack: v3.8.1 → [v3.10.0](https://github.com/webpack/webpack/releases)
- webpack-dev-server: v2.9.4 → [v2.9.7](https://github.com/webpack/webpack-dev-server/releases)
- webpack-dev-middleware: v1.12.0 → [v1.12.2](https://github.com/webpack/webpack-dev-middleware/releases)
- webpack-hot-middleware: v2.20.0 → [v2.21.0](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.20.0...v2.21.0)

## Docs

- Added missing docs for [`webpack.copy` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#copy-array--object)
- Added more headings to the [Commands docs](https://github.com/insin/nwb/blob/master/docs/Commands.md#commands) to make them easier to browse, and to make feature flags such as `--copy-files` for component builds more visible [[#407](https://github.com/insin/nwb/issues/407)]

# 0.20.0 / 2017-11-18

## Breaking Changes

- Updated UMD build config to [export the `default` export of the entry point](https://webpack.js.org/configuration/output/#output-libraryexport), rather than an ES modules interop object which looks something like `{__esModule: true, default: Getter}`, which was unintended behaviour. This will break any existing usage of UMD builds which depended on manually accessing the unintended `default` property [[#402](https://github.com/insin/nwb/issues/402)]
- Updated to Mocha 4, which comes with [a number of breaking changes](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#boom-breaking-changes). These are mostly related to dropping support for older versions of Node.js and non-ES5-compliant browsers.

## Fixed

- Bump the default React peerDependency version for react-component projects to `16.x` - fixes creating components with npm 2.

## Dependencies

- copy-webpack-plugin: v4.2.0 → [v4.2.1](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#421-2017-11-17)
- detect-port: v1.2.1 → [v1.2.2](https://github.com/node-modules/detect-port/releases)
- karma-webpack: v2.0.5 → [v2.0.6](https://github.com/webpack-contrib/karma-webpack/blob/master/CHANGELOG.md#206-2017-11-10)
- mocha: v3.4.2 → [v4.0.1](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#401--2017-10-05) - dropped support for old versions of Node.js and non-ES5-compliant browsers

## Documentation

- Documented `--unsafe-perm` workaround for PhantomJS' postinstall step failing on some OSes when installing globally with npm 5 [[#383](https://github.com/insin/nwb/issues/383)]

# 0.19.2 / 2017-11-09

## Fixed

- Backed out use of `preact/debug` in favour of `preact/devtools`, as the debug module tries to override the preact module's render export, which fails due to Webpack enforcing the read-only nature of ES module exports.

# 0.19.1 / 2017-11-04

## `nwb.config.js` Config Changes

- Deprecated the `webpack.compat.enzyme` flag for Enzyme v2 compatibility settings. Upgrade to Enzyme v3 when you can, which supports React all the way back to v0.13.
  - [An example of configuring Enzyme v3](https://github.com/insin/nwb/blob/master/docs/Testing.md#configuring-testing-libraries) has been added to the [testing docs](https://github.com/insin/nwb/blob/master/docs/Testing.md#testing).

## Fixed

- Added `'createClass'` and `'createReactClass'` to the factory function names [React Transform](https://github.com/gaearon/babel-plugin-react-transform) looks for, so React component hot reloading will work for apps using [`create-react-class`](https://www.npmjs.com/package/create-react-class) imported as one of those names.

## Changed

- nwb is now also tested against Node 8 now that it's the Long Term Support version.
- Reverted the Webpack settings change for `webpack.compat.enzyme` config in v0.19.0, as it only applied while the version numbers of published React packages were out of sync. The compatibility settings assume Enzyme v2 and React >= v15.5.
- `style-loader`'s new `hmr` option is set to `false` when creating builds to prevent inclusion of its HMR code.

## Dependencies

- autoprefixer: v7.1.4 → [v7.1.6](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#716)
- babel-plugin-inferno: v3.2.0 → [v3.3.0](https://github.com/infernojs/babel-plugin-inferno/releases)
- babel-plugin-transform-react-remove-prop-types: v0.4.8 → [v0.4.10](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types/releases)
- babel-preset-env: v1.6.0 → [v1.6.1](https://github.com/babel/babel-preset-env/releases/tag/v1.6.1)
- chalk: v2.1.0 → [v2.3.0](https://github.com/chalk/chalk/compare/v2.1.0...v2.3.0)
- copy-webpack-plugin: v4.1.0 → [v4.2.0](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#420-2017-10-19)
- extract-text-webpack-plugin: v3.0.0 → [v3.0.2](https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/master/CHANGELOG.md#302-2017-10-25)
- file-loader: v1.1.4 → [v1.1.5](https://github.com/webpack-contrib/file-loader/blob/master/CHANGELOG.md#115-2017-10-05)
- filesize: v3.5.10 → [v3.5.11](https://github.com/avoidwork/filesize.js/compare/3.5.10...3.5.11)
- karma-mocha-reporter: v2.2.4 → [v2.2.5](https://github.com/litixsoft/karma-mocha-reporter/blob/master/CHANGELOG.md#225-2017-10-17)
- karma-webpack: v2.0.4 → [v2.0.5](https://github.com/webpack-contrib/karma-webpack/blob/master/CHANGELOG.md#205-2017-10-08)
- phantomjs-prebuilt: v2.1.15 → v2.1.16
- postcss-loader: v2.0.6 → [v2.0.8](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#208-2017-10-14)
- resolve: v1.4.0 → [v1.5.0](https://github.com/substack/node-resolve/compare/v1.4.0...v1.5.0)
- style-loader: v0.18.2 → [v0.19.0](https://github.com/webpack-contrib/style-loader/blob/master/CHANGELOG.md#0190-2017-10-03)
- url-loader: v0.5.9 → [v0.6.2](https://github.com/webpack-contrib/url-loader/blob/master/CHANGELOG.md#062-2017-10-04)
- webpack: v3.6.0 → [v3.8.1](https://github.com/webpack/webpack/releases)
- webpack-dev-server: v2.9.1 → [v2.9.4](https://github.com/webpack/webpack-dev-server/releases)
- webpack-hot-middleware: v2.19.1 → [v2.20.0](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.19.1...v2.20.0)
- webpack-merge: v4.1.0 → [v4.1.1](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#411--2017-11-01)

# 0.19.0 / 2017-10-02

## Breaking Changes

- Removed hooking of React, Preact and Inferno `render()` functions in quick commands, as this won't work with ES modules builds (which are used by default in Webpack v3). This affected the current version of Preact at the time of writing.
  - If you're manually using `render()` with quick commands, you must now handle providing the target DOM node too - `document.getElementById('app')` is available in the default HTML template.

## Added

- Added [`babel.env` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#env-object) to pass additional [options for `babel-preset-env`](https://github.com/babel/babel-preset-env#options).
- Added additional Enzyme [`webpack.compat`](https://github.com/insin/nwb/blob/master/docs/Configuration.md#compat-object) for recent versions of React 15.

## Changed

- Now using `babel-preset-env` instead of deprecated `babel-preset-es201X` presets [[#375](https://github.com/insin/nwb/issues/375)]
- Use `beautify: true` for `webpack.debug` output so code split bundles are readable.

## Dependencies

- autoprefixer: v7.1.2 → [v7.1.4](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#714)
- babel-cli: v6.24.1 → [v6.26.0][babel6260]
- babel-core: v6.24.1 → [v6.26.0][babel6260]
- babel-loader: v7.1.1 → [v7.1.2](https://github.com/babel/babel-loader/releases/tag/v7.1.2)
- babel-plugin-istanbul: v4.1.4 → v4.1.5
- babel-plugin-react-transform: v2.0.2 → [v3.0.0](https://github.com/gaearon/babel-plugin-react-transform/releases) - add `React.PureComponent` to the list of default super classes
- babel-plugin-transform-react-remove-prop-types: v0.4.6 → [v0.4.8](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types/releases)
- babel-polyfill: v6.23.0 → [v6.26.0][babel6260]
- babel-runtime: v6.25.0 → [v6.26.0][babel6260]
- chalk: v2.0.1 → [v2.1.0](https://github.com/chalk/chalk/compare/v2.0.1...v2.1.0)
- copy-webpack-plugin: v4.0.1 → [v4.1.0](https://github.com/webpack-contrib/copy-webpack-plugin/blob/master/CHANGELOG.md#410-2017-09-29)
- css-loader: v0.28.4 → [v0.28.7](https://github.com/webpack-contrib/css-loader/blob/master/CHANGELOG.md#0287-2017-08-30)
- file-loader: v0.11.2 → [v1.1.4](https://github.com/webpack-contrib/file-loader/blob/master/CHANGELOG.md#114-2017-09-30)
- gzip-size: v3.0.0 → v4.0.0 - async interface now uses Promises
- html-webpack-plugin: v2.29.0 → [v2.30.1](https://github.com/jantimon/html-webpack-plugin/blob/master/CHANGELOG.md#v2301)
- inquirer: v3.2.1 → [v3.3.0](https://github.com/SBoudrias/Inquirer.js/releases)
- karma-mocha-reporter: v2.2.3 → [v2.2.4](https://github.com/litixsoft/karma-mocha-reporter/blob/master/CHANGELOG.md#224-2017-08-24)
- karma: v1.7.0 → [v1.7.1](https://github.com/karma-runner/karma/releases/tag/1.7.1)
- mocha: v3.4.2 → [v3.5.3](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#353--2017-09-11)
- phantomjs-prebuilt: v2.1.14 → v2.1.15 - fix security issues with dependencies
- webpack-dev-middleware: v1.11.0 → [v1.12.0](https://github.com/webpack/webpack-dev-middleware/releases/tag/v1.12.0)
- webpack-dev-server: v2.6.1 → [v2.9.1](https://github.com/webpack/webpack-dev-server/releases)
- webpack-hot-middleware: v2.18.2 → [v2.19.0](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.18.2...v2.19.0)
- webpack: v3.4.1 → [v3.6.0](https://github.com/webpack/webpack/releases)

[babel6260]: https://github.com/babel/babel/blob/master/CHANGELOG.md#6260-2017-08-16

# 0.18.10 / 2017-07-27

## Fixed

- Fix dev server HMR for people running on different hosts or a different localhost port [[#356](https://github.com/insin/nwb/issues/356)] [[DethAriel][DethAriel]]

## Dependencies

- babel-runtime: v6.23.0 → v6.25.0
- resolve: v1.3.3 → [v1.4.0](https://github.com/substack/node-resolve/compare/v1.3.3...v1.4.0)
- webpack: v3.4.0 → [v3.4.1](https://github.com/webpack/webpack/releases/tag/v3.4.1)

# 0.18.9 / 2017-07-26

## Changed

- Now using preact/debug instead of preact/devtools in quick Preact commands and the Preact project skeleton - requires Preact >= 8.2.0

## Dependencies

- inquirer: v3.2.0 → [v3.2.1](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.2.1)
- promise: v8.0.0 → v8.0.1
- webpack: v3.2.0 → [v3.4.0](https://github.com/webpack/webpack/releases) - bug fixes; now watches for missing directories being added; perf improvements
- webpack-dev-server: v2.5.1 → [v2.6.1](https://github.com/webpack/webpack-dev-server/releases)

# 0.18.8 / 2017-07-16

## Dependencies

- promise: v8.0.0 → v8.0.1
- webpack: v3.2.0 → [v3.3.0](https://github.com/webpack/webpack/releases/tag/v3.3.0) - bug fixes; now watches for missing directories being added

# 0.18.7 / 2017-07-12

## Changed

- You can now set [`webpack.extractText` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#extracttext-object--boolean) to `false` to disable extraction of stylesheets in builds [[#343](https://github.com/insin/nwb/issues/343)]

## Dependencies

- extract-text-webpack-plugin: v3.0.0-rc.2 → v3.0.0
- webpack: v3.1.0 → [v3.2.0](https://github.com/webpack/webpack/releases/tag/v3.2.0) - bug fixes

## Documentation

- Documented default [`webpack.extractText` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#extracttext-object--boolean).

# 0.18.6 / 2017-07-10

## Dependencies

- extract-text-webpack-plugin: v3.0.0-rc.1 → v3.0.0-rc.2 - fix module sorting type error
- inquirer: v3.1.1 → [v3.2.0](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.2.0)

# 0.18.5 / 2017-07-09

## Dependencies

- extract-text-webpack-plugin: v3.0.0-beta.3 → v3.0.0-rc.1
- karma-webpack: v2.0.3 → [v2.0.4](https://github.com/webpack-contrib/karma-webpack/blob/master/CHANGELOG.md#204-2017-07-07) - Webpack 3 support
- webpack-dev-server: v2.5.0 → [v2.5.1](https://github.com/webpack/webpack-dev-server/releases/tag/v2.5.1) - Webpack 3 support

# 0.18.4 / 2017-07-07

## Fixed

- Fixed use of `@import` in CSS by adding `ident` back to `postcss-loader` config [[#311](https://github.com/insin/nwb/issues/311)]
- Fixed config validation error being thrown when using `webpack.styles` config for custom preprocessor plugin rules [[#342](https://github.com/insin/nwb/issues/342)]
- Fixed display of valid properties when an invalid property is used when configuring a custom `webpack.styles` rule.

## Added

- Added [`webpack.debug` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#debug-boolean) to trigger creation of a more debuggable production build [[#336](https://github.com/insin/nwb/issues/336)]

  The recommended way to use this is via a [config argument](https://github.com/insin/nwb/blob/master/docs/Configuration.md#configuration-via-arguments):

  ```sh
  npm run build -- --webpack.debug
  ```

- Added support for the following arguments when building a React component's demo:
  - `--title` - set the generated demo `index.html`'s `<title>`
  - `--vendor` - enable creation of a vendor bundle for modules imported from `node_modules/` [[#335](https://github.com/insin/nwb/issues/335)]

## Dependencies

- autoprefixer: v7.1.1 → [v7.1.2](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#711)
- babel-loader: v7.1.0 → [v7.1.1](https://github.com/babel/babel-loader/releases/tag/v7.1.1) - don't read `.babelrc` for cache identifier when `babelrc=false` (nwb uses this option)
- chalk: v1.1.3 → [v2.0.1](https://github.com/chalk/chalk/compare/v1.1.3...v2.0.1)
- extract-text-webpack-plugin: v2.1.2 → [v3.0.0-beta.3](https://github.com/webpack-contrib/extract-text-webpack-plugin/releases) - Webpack 3 support
- html-webpack-plugin: v2.28.0 → [v2.29.0](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2290) - Webpack 3 support
- karma-chrome-launcher: v2.1.1 → [v2.2.0](https://github.com/karma-runner/karma-chrome-launcher/blob/master/CHANGELOG.md#220-2017-06-23)
- webpack: v3.0.0 → [v3.1.0](https://github.com/webpack/webpack/releases/tag/v3.1.0) - perf boost; fix ordering in `ExtractTextPlugin`
- webpack-hot-middleware: v2.18.0 → [v2.18.2](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.18.0...v2.18.2)

# 0.18.3 / 2017-06-22

## Fixed

- Quick `build` command config was being created before the default `NODE_ENV = production` was applied, so output filenames didn't include a chunkhash by default.

## Dependencies

- webpack-dev-middleware: v1.10.2 → [v1.11.0](https://github.com/webpack/webpack-dev-middleware/releases/tag/v1.11.0) - Webpack 3 support

# 0.18.2 / 2017-06-22

## Fixed

- Fixed clearing the console by default when running the development server.

## Dependencies

- babel-loader: v7.0.0 → [v7.1.0](https://github.com/babel/babel-loader/releases/tag/v7.1.0) - Webpack 3 support

## Documentation

- Updated [Quick Development with nwb](https://github.com/insin/nwb/blob/master/docs/guides/QuickDevelopment.md#quick-development-with-nwb) for v0.18.

# 0.18.1 / 2017-06-20

## Dependencies

- npm-install-webpack2-plugin: v5.0.0 → v5.0.1 - fix Webpack 3 support

# 0.18.0 / 2017-06-20

## Breaking Changes

- Updated to Webpack 3 - potentially breaking for some plugins [[#326](https://github.com/insin/nwb/issues/326)]

  See the [official release post](https://medium.com/webpack/webpack-3-official-release-15fd2dd8f07b) for changes.

- Removed support for configuration which was [deprecated in nwb v0.15.0](#0150--2017-01-25).

## Fixed

- Fixed display of user config errors when running the dev server.

## Added

- Added [`webpack.hoisting` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#hoisting-boolean) to enable use of Webpack 3's new `ModuleConcatenationPlugin` for scope hoisting in production builds [[#326](https://github.com/insin/nwb/issues/326)]
- [`babel`, `webpack`, `devServer`, `karma` and `npm` configuration](https://github.com/insin/nwb/blob/master/docs/Configuration.md#configuration-object) can now be provided via [arguments using dotted paths](https://github.com/insin/nwb/blob/master/docs/Configuration.md#configuration-via-arguments) [[#327](https://github.com/insin/nwb/issues/327)]

  ```sh
  nwb react build app.js \
    --babel.plugins=react-html-attrs \
    --babel.stage=2 \
    --webpack.hoisting
  ```

  If you have a config file, arguments will override properties in it. This is primarily intended for one-off feature toggles without having to edit your config file, and to provide some level of configuration for [quick development commands](https://github.com/insin/nwb/blob/master/docs/guides/QuickDevelopment.md#quick-development-with-nwb) without needing a config file.

## Changed

- [`babel.plugins`](https://github.com/insin/nwb/blob/master/docs/Configuration.md#plugins-string--array), [`babel.presets`](https://github.com/insin/nwb/blob/master/docs/Configuration.md#presets-string--array) and locales in [`webpack.compat`](https://github.com/insin/nwb/blob/master/docs/Configuration.md#compat-object) config now also accept single configuration as a String to make them usable via arguments [[#327](https://github.com/insin/nwb/issues/327)]

## Dependencies

- inquirer: v3.1.0 → [v3.1.1](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.1.1)
- npm-install-webpack2-plugin: v4.1.1 → v5.0.0 - drop Webpack 1 and add Webpack 3 to peerDeps
- promise: v7.3.0 → v8.0.0
- webpack: v2.6.1 → [v3.0.0](https://github.com/webpack/webpack/releases/tag/v3.0.0)
- webpack-dev-server: v2.4.5 → [v2.5.0](https://github.com/webpack/webpack-dev-server/releases/tag/v2.5.0)

# 0.17.3 / 2017-07-07

## Fixed

Backported fixes from 0.18:

- Fixed use of `@import` in CSS by adding `ident` back to `postcss-loader` config [[#311](https://github.com/insin/nwb/issues/311)]
- Fixed display of valid properties when an invalid property is used when configuring a custom `webpack.styles` rule.

# 0.17.2 / 2017-07-04

## Fixed

Backported fixes from 0.18:

- Fixed display of user config errors when running the development server.
- Fixed clearing the console by default when running the development server.
- Quick build command config was being created before the default `NODE_ENV = production` was applied, so output filenames didn't include a chunkhash by default.
- Fixed config validation error when running the development server and using `webpack.styles` config for custom preprocessor plugin rules.

# 0.17.1 / 2017-06-19

## Fixed

- Fixed using a custom port for the dev server - Webpack Dev Server's client didn't like the format we were specifying the URL for the Hot Module Reloading connection in [[#328](https://github.com/insin/nwb/issues/328)]
- Use the correct protocol in the `'The app is running at...'` successful compilation message when using HTTPS.

# 0.17.0 / 2017-06-17

## Breaking Changes

- Now using [Webpack Dev Server](https://github.com/webpack/webpack-dev-server) (instead of running a basic Express development server).

  Webpack Dev Server has [security features](https://github.com/insin/inputmask-core) which you may need to configure your way around if you're using `--host` or if your development setup involves hitting the dev server from a different host.

  Please [create an issue](https://github.com/insin/nwb/issues/new) if you're affected by this change and there's something nwb can do to mitigate dev server problems without compromising security.

**React components/libraries**

- A [`--[keep-]proptypes` flag](https://github.com/insin/nwb/blob/master/docs/guides/ReactComponents.md#--keep-proptypes) replaces `--no[-wrap]-proptypes` to disable wrapping of  `propTypes` in React component project builds so they'll be stripped from a production build.

## Fixed

- The process will now exit with a non-zero code when a Webpack build completes with errors [[#290](https://github.com/insin/nwb/issues/290)]
- Fixed transpiling of ES2017 features when use of a stage-X preset is disabled with [`babel.stage = false` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#stage-number--false).
- Fixed `hmre = false` [Express middleware option](https://github.com/insin/nwb/blob/master/docs/Middleware.md#options) for disabling use of [React Transform](https://github.com/gaearon/babel-plugin-react-transform#readme) to attempt to handle Hot Module Reloading for React components and `render()` error display [[#263](https://github.com/insin/nwb/issues/263)]

**Preact**

- Fixed importing React components when serving a Preact app - this was missed when fixing `preact-compat` configuration issues from v0.16.0.

## Added

**Arguments**

- Added a [`--no-clear[-console]` flag](https://github.com/insin/nwb/blob/master/docs/Commands.md#nwb-serve) to disable clearing of the console when running the dev server.
- Added a [`--no-html` flag](https://github.com/insin/nwb/blob/master/docs/Commands.md#nwb-build) to disable creation of an `index.html` file if you don't need one (e.g. you're serving your built apps via another means) [[#278](https://github.com/insin/nwb/issues/278)] [[bwendt-mylo][bwendt-mylo]]

**Commands**

- Added an `nwb web (run|build)` command for [quick development](https://github.com/insin/nwb/blob/master/docs/guides/QuickDevelopment.md#quick-development-with-nwb) with vanilla JavaScript (i.e. you're in charge of rendering).

**Configuration**

- Added [`devServer` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#devserver-object) to configure [Webpack Dev Server options](https://webpack.js.org/configuration/dev-server/#devserver), which include:
  - `devServer.historyApiFallback.disableDotRule` can be enabled if you need to use dots in your path when using the HTML5 History API
  - `devServer.https` can be used to enable HTTPS
  - `devServer.proxy` can be used to proxy certain URLs to a separate API backend development server
- Added a [`type` option](https://github.com/insin/nwb/blob/master/docs/Middleware.md#options) to nwb's Express middleware to set the project type (one of `react`, `preact`, `inferno` or `web`) manually, enabling use of the middleware without a config file.

**React**

- Added [`babel.removePropTypes` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#removeproptypes-object--false) to disable or configure [removal of `propTypes`](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types) in React app production builds.
- Added [`babel.reactConstantElements` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#reactconstantelements-false) to disable the use of the [React constant element hoisting transform](https://babeljs.io/docs/plugins/transform-react-constant-elements/) in React app production builds.

## Changed

**npm modules**

- Default Babel config for `react-component` and `web-module` projects now uses [`babel-preset-stage-1`](http://babeljs.io/docs/plugins/preset-stage-1/), so you can use [export extensions](http://babeljs.io/docs/plugins/transform-export-extensions/) by default if you need to re-export a library's modules in `src/index.js` [[#284](https://github.com/insin/nwb/issues/284)]
- Default Travis CI config for `react-component` and `web-module` projects now only uses Node 6 by default for quicker builds.

**Preact**

- [`preact/devtools`](https://github.com/developit/preact#developer-tools) is now imported in development mode to enable use of React Developer Tools when using `nwb preact run`. This has also been added to the `preact-app` template.

  For existing Preact apps, add the following to its entry point to enable this:

  ```
  if (process.env.NODE_ENV === 'development') {
    require('preact/devtools')
  }
  ```

**React components/libraries**

- [`prop-types`](https://github.com/facebook/prop-types#prop-types) imports are now also removed from React component UMD production builds.

## Documentation

- Document the [`--copy-files` flag](https://github.com/insin/nwb/blob/master/docs/guides/ReactComponents.md#--copy-files) properly [[#317](https://github.com/insin/nwb/issues/317)]

## Dependencies

- babel-core: v6.24.1 → [v6.25.0](https://github.com/babel/babel/releases/tag/v6.25.0)
- babel-plugin-transform-react-remove-prop-types: v0.4.5 → [v0.4.6](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types/releases/tag/v0.4.6) - fix use in Node 4
- babel-preset-es2017: v6.24.1
- detect-port: v1.1.3 → [v1.2.1](https://github.com/node-modules/detect-port/releases)
- extract-text-webpack-plugin: v2.1.0 → [v2.1.2](https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/master/CHANGELOG.md#212-2017-06-08)
- file-loader: v0.11.1 → [v0.11.2](https://github.com/webpack-contrib/file-loader/blob/master/CHANGELOG.md#0112-2017-06-05) - `publicPath` option changes
- inquirer: v3.0.6 → [v3.1.0](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.1.0)
- ora: v1.2.0 → v1.3.0
- postcss-loader: v2.0.5 → [v2.0.6](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#206-2017-06-14)
- promise: v7.1.1 → v7.3.0
- style-loader: v0.18.1 → [v0.18.2](https://github.com/webpack-contrib/style-loader/blob/master/CHANGELOG.md#0182-2017-06-05)
- url-loader: v0.5.8 → [v0.5.9](https://github.com/webpack-contrib/url-loader/releases/tag/v0.5.9)
- [webpack-dev-server](https://github.com/webpack/webpack-dev-server/): v2.4.5

# 0.16.3 / 2017-05-31

**Dependencies:**

- case-sensitive-paths-webpack-plugin: v2.0.0 → [v2.1.1](https://github.com/Urthen/case-sensitive-paths-webpack-plugin/blob/master/CHANGELOG.md#211) - don't intercept Webpack "File not found" error, resolve issue with not recognising when a new file is added

# 0.16.2 / 2017-05-31

**Fixed:**

- Fixed validation of `webpack.styles` config to allow it to be set to `false` [[#312](https://github.com/insin/nwb/pull/312)] [[seanofw][seanofw]]

**Dependencies:**

- css-loader: v0.28.3 → [v0.28.4](https://github.com/webpack-contrib/css-loader/blob/master/CHANGELOG.md#0284-2017-05-30) - preserve leading underscore in class names

# 0.16.1 / 2017-05-31

**Fixed:**

- Fixed bad render shim paths which were breaking the `nwb react`, `nwb preact` and `nwb inferno` quick development commands.
- Fixed `nwb preact` commands and `nwb react`'s `--preact[-compat]` when used with Preact 8 by removing a workaround for an old preact-compat distribution issue.

**Added:**

- Added support for [create-react-class](https://facebook.github.io/react/docs/react-without-es6.html) when using `preact-compat`.

**Dependencies:**

- css-loader: v0.28.3 → [v0.28.4](https://github.com/webpack-contrib/css-loader/blob/master/CHANGELOG.md#0284-2017-05-30) - preserve leading underscore in class names

# 0.16.0 / 2017-05-29

**Breaking Changes:**

- Global `react`, `preact`, and `inferno` commands are no longer installed when nwb is installed globally [[#308](https://github.com/insin/nwb/issues/308)]

  These are now subcommands of the global `nwb` command, to avoid conflicting with global commands installed by official tools for these libraries, e.g. [`preact-cli`](https://github.com/developit/preact-cli) is now available, which provides a global `preact` command.
- Node.js 4.6.0 is now the minimum required version, based on the `engines` config of nwb's dependencies,
- A separate Webpack rule for stylesheets imported from `node_modules/` is no longer created by default.

  > For backwards compatibility you can set [`webpack.style` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#styles-object--false--old) to `'old'` to use the old default behaviour - this capability will be removed in a future release.
- The Babel plugin for Inferno now requires Inferno >= 1.5 and is not backwards-compatible with 1.4.
- Default Webpack config now sets `module.strictExportPresence = true` so a missing export is now a compile error.
- Default `ExtractTextPlugin` now sets `allChunks = true` to extract stylesheets from all chunks and avoid including the `style-loader` runtime in builds by default.

**Added:**

- You can now control [how Webpack rules are created for stylesheets](https://github.com/insin/nwb/blob/master/docs/Stylesheets.md#stylesheets) via [`webpack.styles` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#styles-object--false--old).

  This allows you to set up multiple rules for your own stylesheets (e.g. using CSS Modules only for stylesheets in a particular directory) and to provide rules for dependencies which need a specific Webpack rule for their stylesheets.

  You can also disable creation of stylesheet rules by setting `webpack.styles` to `false`.
- Re-enabled the `react-constant-elements` transform for React production builds, due to significant bug fixes.
- Added a `--no-hmre` flag for use when serving a React app, to disable use of [React Transform](https://github.com/gaearon/babel-plugin-react-transform#readme) to attempt to automatically handle Hot Module Replacement for React components and display an overlay with `render()` errors [[#263](https://github.com/insin/nwb/issues/263)]
- Added support for [intl](https://github.com/andyearnshaw/Intl.js/) and [react-intl](https://github.com/yahoo/react-intl) in [`webpack.compat` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#compat-object) [[#260](https://github.com/insin/nwb/pull/260)] [[grahamlyus][grahamlyus]]
- You can now provide a [`webpack.config()` function](https://github.com/insin/nwb/blob/master/docs/Configuration.md#config-function) which will be given the generated Webpack config to do whatever it wants with [[#256](https://github.com/insin/nwb/issues/256)]
- You can now provide [`use` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#customising-loaders) with a list of loaders in `webpack.rules` to replace a rule's default loader with chained loaders [[#256](https://github.com/insin/nwb/issues/256)]
- You can now [disable a default Webpack config rule](https://github.com/insin/nwb/blob/master/docs/Configuration.md#disabling-default-rules) by setting it to `false` [[#256](https://github.com/insin/nwb/issues/256)]

**Changed:**

- Default options are no longer used if you provide a custom `loader` for a rule in `webpack.rules` [[#256](https://github.com/insin/nwb/issues/256)]
- React project templates now use classes and `React.Component` instead of `React.createClass()`, which is deprecated as of React v15.5 [[#216](https://github.com/insin/nwb/issues/216)]

**Fixed:**

- Fixed chunk hash not changing when imports in a split chunk are changed, by dropping use of the `webpack-md5-hash` plugin [[#301](https://github.com/insin/nwb/issues/301)] [[grahamlyus][grahamlyus]]
- Added missing config for `CopyWebpackPlugin` when serving a `react-component` project's demo app, so any static content in `demo/public/` will be also served by the dev server [[#307](https://github.com/insin/nwb/issues/307)]
- Removed `node_modules/` caching from default Travis CI config in project skeletons, as it's been reported to cause build failures [[#271](https://github.com/insin/nwb/issues/271)]
- An output directory specified with a trailing slash is now cleaned properly when creating a build.
- A `loader` configured for a Webpack rule is no longer moved into the `options` object when an options object hasn't been explicitly configured [[#256](https://github.com/insin/nwb/issues/256)]
- Fixed cleaning nested dirs, including a demo app's `demo/dist/` dir.
- Fixed cleaning output directories specified with a trailing slash.

**Dependencies:**

- autoprefixer: v6.7.0 → [v7.1.1](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#711)
- babel-cli: v6.22.2 → [v6.24.1][babel6241]
- babel-core: v6.22.1 → [v6.24.1][babel6241]
- babel-loader: v6.2.10 → [v7.0.0](https://github.com/babel/babel-loader/releases/tag/v7.0.0)
- babel-plugin-inferno: v1.7.0 → [v3.2.0](https://github.com/infernojs/babel-plugin-inferno/releases) - adds support for Inferno 1.5, not backwards-compatible with 1.4
- babel-plugin-istanbul: v3.1.2 → [v4.1.4](https://github.com/istanbuljs/babel-plugin-istanbul/blob/master/CHANGELOG.md#414-2017-05-27) - drop support for Node.js 0.10 and v0.12
- babel-plugin-transform-react-jsx: v6.22.0 → [v6.24.1][babel6241]
- babel-plugin-transform-react-remove-prop-types: v0.2.11 → [v0.4.5](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types/releases) - dropped support for `React.createClass()` in favour of the new `create-react-class` package
- babel-plugin-transform-runtime: v6.22.0 → [v6.23.0][babel6230]
- babel-polyfill: v6.22.0 → [v6.23.0][babel6230]
- babel-preset-es2015: v6.22.0 → [v6.24.1][babel6241]
- babel-preset-es2016: v6.22.0 → [v6.24.1][babel6241]
- babel-preset-react: v6.22.0 → [v6.24.1][babel6241]
- babel-preset-stage-0: v6.22.0 → [v6.24.1][babel6241]
- babel-preset-stage-1: v6.22.0 → [v6.24.1][babel6241]
- babel-preset-stage-2: v6.22.0 → [v6.24.1][babel6241]
- babel-preset-stage-3: v6.22.0 → [v6.24.1][babel6241]
- babel-runtime: v6.22.0 → [v6.23.0][babel6230]
- case-sensitive-paths-webpack-plugin: v1.1.4 → [v2.0.0](https://github.com/Urthen/case-sensitive-paths-webpack-plugin/blob/master/CHANGELOG.md#2017-3-31) - use the file system exposed by the compiler
- css-loader: v0.26.1 → [v0.28.3](https://github.com/webpack-contrib/css-loader/blob/master/CHANGELOG.md#0283-2017-05-25) - added an [`alias` option](https://github.com/webpack-contrib/css-loader#alias)
- detect-port: v1.1.0 → [v1.1.3](https://github.com/node-modules/detect-port/blob/master/HISTORY.md#113--2017-05-24)
- express: v4.14.0 → [v4.15.3](https://github.com/expressjs/express/blob/master/History.md#4153--2017-05-16)
- file-loader: v0.9.0 → [v0.11.1](https://github.com/webpack-contrib/file-loader/blob/master/CHANGELOG.md#0111-2017-04-01) - added `useRelativePath` option
- filesize: v3.4.3 → [v3.5.10](https://github.com/avoidwork/filesize.js/compare/3.4.3...3.5.10)
- inquirer: v3.0.1 → [v3.0.6](https://github.com/SBoudrias/Inquirer.js/releases/)
- karma: v1.4.0 → [v1.7.0](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#170-2017-05-06)
- karma-chrome-launcher: v2.0.0 → [v2.1.1](https://github.com/karma-runner/karma-chrome-launcher/blob/master/CHANGELOG.md#211-2017-05-05) - add support for headless Chrome/ChromeCanary
- karma-mocha-reporter: v2.2.2 → [v2.2.3](https://github.com/litixsoft/karma-mocha-reporter/blob/master/CHANGELOG.md#223-2017-03-20)
- karma-phantomjs-launcher: v1.0.2 → [v1.0.4](https://github.com/karma-runner/karma-phantomjs-launcher/blob/master/CHANGELOG.md#104-2017-03-10) - fixed more path issues
- karma-webpack: v2.0.1 → [v2.0.3](https://github.com/webpack-contrib/karma-webpack/blob/master/CHANGELOG.md#203-2017-03-15) - don't swallow configuration errors
- mocha: v3.2.0 → [v3.4.2](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#342--2017-05-24)
- ora: v1.1.0 → v1.2.0 - added `warn()` and `info()` utilities
- postcss-loader: v1.2.2 → [v2.0.5](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#205-2017-05-10) - validate options
- resolve: v1.2.0 → [v1.3.3](https://github.com/substack/node-resolve/compare/v1.2.0...v1.3.3)
- style-loader: v0.13.1 → [v0.18.1](https://github.com/webpack-contrib/style-loader/blob/master/CHANGELOG.md#0181-2017-05-23)
- url-loader: v0.5.7 → [v0.5.8](https://github.com/webpack-contrib/url-loader/releases/tag/v0.5.8) - fix loader util deprecation warning
- webpack: v2.2.1 → [v2.6.1](https://github.com/webpack/webpack/releases) - `import()` can now configure a chunk name, `require.ensure()` can now take an error callback, added `module.strictExportPresence`
- webpack-dev-middleware: v1.9.0 → [v1.10.2](https://github.com/webpack/webpack-dev-middleware/releases) - CORS security fix
- webpack-hot-middleware: v2.15.0 → [v2.18.0](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.15.0...v2.18.0) - client overlay style can now be customised with CSS using `#webpack-hot-middleware-clientOverlay`
- webpack-merge: v2.4.0 → [v4.1.0](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#410--2017-03-16)
- whatwg-fetch: v2.0.2 → [v2.0.3](https://github.com/github/fetch/releases/tag/v2.0.3)

[babel6230]: https://github.com/babel/babel/blob/master/CHANGELOG.md#6230-2017-02-13
[babel6241]: https://github.com/babel/babel/blob/master/CHANGELOG.md#6240-2017-03-13

**Internal:**

- Use `fs` and `fs-extra` instead of `glob` and `rimraf`, which are now only `devDependencies`.

# 0.15.8 / 2017-05-11

**Dependencies:**

- extract-text-webpack-plugin: [v2.1.0](https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/master/CHANGELOG.md#210-2017-03-05) - fix bad scoped version in nwb v0.15.7
- html-webpack-plugin: v2.26.0 → [v2.28.0](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2280) - revert relative loader resolving change from v2.25.0 back to a full path
- webpack: v2.2.0 → [v2.2.1](https://github.com/webpack/webpack/releases/tag/v2.2.1) - `ident` is now automatic, fixes issue passing options to postcss-loader

# 0.15.7 / 2017-05-11

**Added:**

- Added [`npm.cjs` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#cjs-boolean) to disable creation of a CommonJS build in `lib/` if you don't need it [[#285](https://github.com/insin/nwb/issues/285)] [[treshugart][treshugart]]

**Changed:**

- Disable creation of a minified UMD build when [`webpack.uglify` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#uglify-object--false) is `false` [[#288](https://github.com/insin/nwb/issues/288)] [[treshugart][treshugart]]
- Support use of Karma `customLaunchers` which start with "Chrome" [[#296](https://github.com/insin/nwb/pull/296)] [[michaelsbradleyjr][michaelsbradleyjr]]

**Fixed:**

- Fixed typo in `clean` command in `react-component` skeleton [[#283](https://github.com/insin/nwb/pull/283)] [[totaldis][totaldis]]

**Documentation:**

- [Document use of Karma's `usePolling` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#karma-configuration) to reduce CPU usage on macOS [[#297](https://github.com/insin/nwb/issues/297)] [[michaelsbradleyjr][michaelsbradleyjr]]

# 0.15.6 / 2017-02-11

**Changed:**

- Explicitly call `process.exit(0)` from the `nwb` command when there are no errors running a command [[#262](https://github.com/insin/nwb/pull/262)]

# 0.15.5 / 2017-02-06

**Fixed:**

- Fixed blank version being set for the React `peerDependency` in new `react-component` projects.
- Use the transpiled ES5 version of `preact-compat` for compatibility builds using `react build` with the `--preact` flag, to prevent UglifyJS errors [[#244](https://github.com/insin/nwb/issues/244)]

# 0.15.4 / 2017-01-26

**Changed:**

- Support the Array version of deprecated `webpack.postcss` config.
- Tell the user they're including redundant config if they've manually configured `inferno-compat` or `preact-compat` aliases for React modules [[#247](https://github.com/insin/nwb/issues/247)]

# 0.15.3 / 2017-01-25

**Fixed:**

- Added a missing `.default` to the Preact project skeleton where CommonJS `require()` was being used to import an ES module [[#245](https://github.com/insin/nwb/issues/245)]

  `.default` must now be used to access the default export from an ES module when importing with CommonJS `require()` as Webpack 2 prevents module format mixing, which was previously used to provide CommonJS interop.

# 0.15.2 / 2017-01-25

**Fixed:**

- Use the transpiled ES5 version of `preact-compat`, as UglifyJS can't handle the ES `module` build [[#244](https://github.com/insin/nwb/issues/244)]

# 0.15.1 / 2017-01-25

**Removed:**

- Remove hints about possibly not needing `babel.cherryPick` due to Webpack 2 tree shaking, as this doesn't currently appear to be true.

# 0.15.0 / 2017-01-25

**Breaking Changes:**

- **Upgraded from Webpack 1 to Webpack 2** [[#110](https://github.com/insin/nwb/issues/110)]

  **Minimum Node.js version increased from 4.2 to 4.3** - this is Webpack 2's minimum supported Node.js version.

  **Strict Webpack configuration** - Webpack 2 is strict about what appears in its configuration object. If you're using [`webpack.extra` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#extra-object), it **must** conform to [Webpack 2's configuration format](https://webpack.js.org/configuration/) or your build will fail with a validation error.

  **Dropped CommonJS compatibility when importing ES modules** - Webpack 2 no longer allows you to mix CommonJS modules with ECMAScript modules - if a module uses `import` or `export` syntax, `exports` will be `undefined` and `module.exports` will be read-only and `undefined`.

  As a result, we can no longer provide CommonJS interop by default for ES Modules - you will need to check your code for usage of CommonJS `require()` to import ES modules and tack a `.default` on the end if you need to use the module's `export default`.

  > If you used nwb's Preact project skeleton, the `init()` function in `index.js` needs to have a `.default` tacked on when the `App` component is being imported.

  **Custom top-level properties no longer allowed in Webpack configuration** - Webpack 2 no longer allows custom top-level properties in its configuration. Loader configuration which can't be serialised, such as plugin objects, can now be provided directly as loader options instead using [`webpack.rules` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#rules-object) instead.

  This includes `postcss-loader`, which is now configured via `webpack.rules` instead of having its own special `webpack.postcss` config.

**`nwb.config.js` Config Format Changes:**

> For deprecations, nwb will continue to support the old format for the next couple of releases, displaying warning messages about the changes required and adapting deprecated config for use in the current version where possible.
>
> If you have an `nwb.config.js` file, run [`nwb check-config`](https://github.com/insin/nwb/blob/master/docs/Commands.md#check-config-command) after updating nwb to find out if there's anything you need to change.

- Deprecated `karma.testDirs`, renaming this config to `karma.excludeFromCoverage`, as it can be configured to exclude any paths from code coverage, not just directories [[#236](https://github.com/insin/nwb/issues/236)]

  ```js
  // < v0.15                         // v0.15
  module.exports = {                 module.exports = {
    karma: {                           karma: {
      testDirs: [                =>      excludeFromCoverage: [
        'test/',                           'test/',
        'path/to/ignorethis.js'            'path/to/ignorethis.js'
      ]                                  ]
    }                                  }
  }                                  }
  ```

- Deprecated `webpack.loaders`, renaming this config to `webpack.rules` to match Webpack 2's new config format:

  ```js
  // < v0.15              // v0.15
  module.exports = {      module.exports = {
    webpack: {              webpack: {
      loaders: {      =>      rules: {
        /* ... */               /* ... */
      }                       }
    }                       }
  }                       }
  ```

- Deprecated use of a  `query` property to configure Webpack rule options as a separate object - an `options` property should now be used as per Webpack 2's new config format:

  ```js
  // < v0.15                        // v0.15
  module.exports = {                module.exports = {
    webpack: {                        webpack: {
      loaders: {                        rules: {
        css: {                            css: {
          query: {              =>          options: {
            modules: /* ... */                modules: /* ... */
          }                                 }
        }                                 }
      }                                 }
    }                                 }
  }                                 }
  ```

  You can also still configure loader options as a flat object to make this particular change irrelevant:

  ```js
  module.exports = {
    webpack: {
      rules: {
        css: {
          modules: /* ... */
        }
      }
    }
  }
  ```

- Deprecated configuring PostCSS plugins with special `webpack.postcss` config - postcss-loader can now be configured like any other loader using [`webpack.rules` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#configuring-postcss):

  ```js
  // < v0.15                           // v0.15
  module.exports = {                   module.exports = {
    webpack: {                           webpack: {
      postcss: [                   =>      rules: {
        require('precss')(),                 postcss: {
        require('autoprefixer')()              plugins: [
      ]                                          require('precss')(),
    }                                            require('autoprefixer')()
  }                                            ]
                                             }
                                           }
                                         }
                                       }
  ```

**Removed:**

- Removed support for configuration which was deprecated in nwb v0.12.
- Removed support for `json-schema` in `webpack.compat` config, as this library has now been fixed [[#227](https://github.com/insin/nwb/issues/227)]

**Dependencies:**

- autoprefixer: v6.6.1 → [v6.7.0](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#670)
- babel-cli: v6.18.0 → [v6.22.2](https://github.com/babel/babel/blob/master/CHANGELOG.md#6222-2017-01-19)
- babel-core: v6.21.0 → [v6.22.1](https://github.com/babel/babel/blob/master/CHANGELOG.md#6221-2017-01-19)
- babel-plugin-inferno: v1.5.0 → v1.7.0 - make plugin ES5-environment compatible; add option to import `createVNode`
- babel-plugin-transform-react-jsx: v6.8.0 → [v6.22.0][babel6220]
- babel-plugin-transform-react-jsx-self: v6.11.0 → [v6.22.0][babel6220]
- babel-plugin-transform-react-jsx-source: v6.9.0 → [v6.22.0][babel6220]
- babel-plugin-transform-runtime: v6.15.0 → [v6.22.0][babel6220]
- babel-polyfill: v6.20.0 → [v6.22.0][babel6220]
- babel-preset-es2015: v6.18.0 → [v6.22.0][babel6220]
- babel-preset-es2016: v6.16.0 → [v6.22.0][babel6220]
- babel-preset-react : v6.16.0 → [v6.22.0][babel6220]
- babel-preset-stage-0: v6.16.0 → [v6.22.0][babel6220]
- babel-preset-stage-1: v6.16.0 → [v6.22.0][babel6220]
- babel-preset-stage-2: v6.18.0 → [v6.22.0][babel6220]
- babel-preset-stage-3: v6.17.0 → [v6.22.0][babel6220]
- babel-runtime: v6.20.0 → [v6.22.0][babel6220]
- detect-port: v1.0.7 → [v1.1.0](https://github.com/node-modules/detect-port/compare/1.0.7...1.1.0)
- filesize: v3.3.0 → [v3.4.3](https://github.com/avoidwork/filesize.js/compare/3.3.0...3.4.3)
- html-webpack-plugin: v2.24.1 → [v2.26.0](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2260) - Webpack 2 RC support
- inquirer: v2.0.0 → [v3.0.1](https://github.com/SBoudrias/Inquirer.js/releases/) - drop Node.js 0.12 support
- karma: v1.3.0 → [v1.4.0](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#140-2017-01-14)
- karma-mocha-reporter: v2.2.1 → [v2.2.2](https://github.com/litixsoft/karma-mocha-reporter/blob/master/CHANGELOG.md#222-2017-01-19)
- karma-webpack: v1.8.0 → v2.0.1 - Webpack 2 RC support
- object-assign: v4.1.0 → [v4.1.1](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#122)
- ora: v0.4.1 → v1.1.0 - text can now be changed while stopping and persisting
- postcss-loader: v1.2.1 → [v1.2.2](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#122)
- webpack: v1.14.0 → [v2.2.0](https://medium.com/webpack/webpack-2-2-the-final-release-76c3d43bf144) - \o/
- webpack-merge: v2.3.1 → [v2.4.0](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#240--2017-01-12)
- whatwg-fetch: v2.0.1 → [v2.0.2](https://github.com/github/fetch/releases/tag/v2.0.2)

[babel6220]: https://github.com/babel/babel/blob/master/CHANGELOG.md#6220-2017-01-19

**Temporarily Scoped Dependencies:**

These are being scoped to both make use of unreleased features and to test them out:

- @insin/extract-text-webpack-plugin - scoped until [this PR](https://github.com/webpack/extract-text-webpack-plugin/pull/343) is merged and released
- @insin/npm-install-webpack-plugin - scoped until new features are merged and released

**Internal:**

- Dropped unused `fs-extra` dependency.
- Use [`babel-preset-env`](https://github.com/babel/babel-preset-env/) when transpiling to `lib/`, targeting Node.js 4 [[#233](https://github.com/insin/nwb/issues/233)]
- Use ES2015 `String` methods available in Node.js 4 instead of `String.prototype.indexOf` comparisons [[#222](https://github.com/insin/nwb/issues/222)]

# 0.14.3 / 2017-01-21

**Fixed:**

- Fix `inferno build` command [[#241](https://github.com/insin/nwb/issues/241)] [[balazs4][balazs4]]

# 0.14.2 / 2017-01-20

**Fixed:**

- Fix using Express middleware with a config file which exports a function [[#238](https://github.com/insin/nwb/issues/238)]

# 0.14.1 / 2017-01-13

**Fixed:**

- Fix running tests with base config only (`web-app` and `web-module` projects).

**Dependencies:**

- Downgrade `html-webpack-plugin` to v2.24.1 while issues later versions cause with `npm-install-webpack-plugin` are unresolved.

# 0.14.0 / 2017-01-13

**Fixed:**

- To prevent version compatibility issues using project commands from a globally-installed `nwb`, it will now exit with a warning if the project specifies a different version of nwb in `package.json` [[#167](https://github.com/insin/nwb/issues/167)]
  - The ability to run project commands like `build`, `serve` etc. from a global `nwb` install is provided so you don't have to reinstall the entirety of nwb when creating new projects, but it's *recommended* that you switch to a locally-installed version later, as relying on globally-installed tool versions is brittle.
- Fix `clean` commands in paths with spaces [[#181](https://github.com/insin/nwb/issues/181)]

**Added:**

- Added an `inferno` command for quick Inferno prototyping and building. Use `inferno run <entry.js>` to serve a module and `inferno build <entry.js> [dist/]` to build it.
- Added a `preact` command for quick Preact prototyping and building. Use `preact run <entry.js>` to serve a module and `preact build <entry.js> [dist/]` to build it.
- The `inferno` and `preact` commands use a render shim module by default which hooks into `Inferno.render()` and `Preact.render()` to intercept the incoming VNode and re-render it from the top when accepting Hot Module Replacement, so if you're calling `render()` yourself you don't have to specify a DOM node, or a `root` when re-rendering in Preact.
  - If you want to take full control of rendering, use the `--force` flag and nwb will skip the render shim and use your entry module directly.
  - The `react` command's render shim doesn't hook into `ReactDOM.render()` and only handles rendering exported components or elements for convenient prototyping, as [react-transform-hmr](https://github.com/gaearon/react-transform-hmr) handles the details of accepting Hot Module Replacement and patching/re-rendering at the component/module level.
- Added new features which are available in the `inferno` and `preact` commands to the existing `react` command:
  - Added a `--plugins` option to specify nwb plugins which should be installed and used without having to set up a `package.json`.
  - Added a `--force` option to force use of the provided entry module directly instead of the render shim module which is used by default to support quick prototyping.
  - Added a `--no-polyfill` option to disable inclusion of nwb's default polyfills for `Promise`, `fetch()` and `Object.assign()` if you're not using them or don't need them polyfilled.
  - Inferno compat and Preact compat dependencies are now automatically installed if missing.
  - `react build` can now build a module which exports a React component or element, for quick sharing of prototypes.
- Inferno and Preact apps are now configured to use their respective React compatibility modules by default if `react` or `react-dom` are imported, allowing use of existing React code out of the box.

**Changed:**

- The Webpack manifest module is now generated when building an app (as well as being inlined into the generated `index.html`) - you will need to include this first if manually handling HTML generation after building.
- Express middleware now supports Inferno, Preact and plain JavaScript apps, not just React.
- When building a React app using the `--inferno` or `--preact` flags, the required compatibility dependencies are now installed automatically if they can't be resolved from your project directory.
- When creating new projects, the latest version of dependencies will be installed, rather than using a a version range hardcoded in nwb.
- Skip initialising a Git repo if a `.git/` directory already exists, e.g. you may want to use `nwb init` in an existing repo.
- The default build for a React component demo app now supports use of a `demo/public/` directory for static content.
- An `args` property is now included in the object passed to user configs which export a function - this contains parsed arguments, e.g. `args.preact` will be `true` if you passed `--preact` when calling `nwb`.

**Removed:**

- Removed support for using `--set-env-VAR_NAME` arguments to set environment variables.
- `jsnext:main` is no longer included `package.json` for new `react-component` and `web-module` projects - only the "more standard" `module` property is used to point to an ES2015 modules build [[#215](https://github.com/insin/nwb/issues/215)]

**Dependencies:**

- autoprefixer: v6.5.3 → [v6.6.1](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#661)
- babel-core: v6.20.1 → v6.21.0
- babel-loader: v6.2.9 → [v6.2.10](https://github.com/babel/babel-loader/blob/master/CHANGELOG.md#v6210) - Webpack 2 RC support
- babel-plugin-inferno: v1.4.0 → v1.5.0 - use import instead of global Inferno reference
- babel-plugin-istanbul: v3.0.0 → [v3.1.2](https://github.com/istanbuljs/babel-plugin-istanbul/blob/master/CHANGELOG.md#312-2017-01-04)
- babel-plugin-lodash: v3.2.10 → [v3.2.11](https://github.com/lodash/babel-plugin-lodash/compare/3.2.10...3.2.11)
- detect-port: v1.0.6 → [v1.0.7](https://github.com/node-modules/detect-port/releases/tag/1.0.7)
- diff: v3.1.0 → [v3.2.0](https://github.com/kpdecker/jsdiff/blob/master/release-notes.md#v320---december-26th-2016)
- html-webpack-plugin: v2.24.1 → [v2.26.0](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2260) - Webpack 2 RC support
- karma-webpack: v1.8.0 → v1.8.1 - Webpack 2 RC support
- ora: v0.3.0 → v0.4.1
- phantomjs-prebuilt: v2.1.13 → [v2.1.14](https://github.com/Medium/phantomjs/releases/tag/2.1.14)
- postcss-loader: v1.2.0 → [v1.2.1](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#121)
- resolve: v1.1.7 → [v1.2.0](https://github.com/substack/node-resolve/compare/1.1.7...v1.2.0)
- webpack-dev-middleware: v1.8.4 → [v1.9.0](https://github.com/webpack/webpack-dev-middleware/releases/tag/v1.9.0) - Webpack 2 RC support
- webpack-hot-middleware: v2.13.2 → [v2.15.0](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.13.2...v2.15.0) - add cache for warnings
- webpack-merge: v1.0.2 → [v2.3.1](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#231--2017-01-06) - providing an empty array/object no longer overrides when merging

# 0.13.8 / 2016-12-31

**Changed:**

- Inferno apps now use Inferno 1.x by default.

**Dependencies:**

- babel-plugin-inferno: v1.3.0-beta17 → v1.4.0

# 0.13.7 / 2016-12-25

**Fixed:**

- Updated Inferno Babel plugin to fix whitespace trimming issue.

**Changed:**

- Updated default Inferno version for new apps to 1.0.0-beta42.

**Dependencies:**

- babel-plugin-inferno: v1.2.0-beta13 → v1.3.0-beta17 - fixes whitespace trimming around newlines

# 0.13.6 / 2016-12-13

**Fixed:**

* Don't configure the [babel runtime transform](https://babeljs.io/docs/plugins/transform-runtime/)'s `moduleName` path when transpiling code for npm [[#205](https://github.com/insin/nwb/issues/205)]

  If you depend on `babel-runtime` in a React component or Web module (by using `async`/`await` or [enabling any of the runtime transform's other features](https://github.com/insin/nwb/blob/master/docs/Configuration.md#runtime-string--boolean) it needs to be resolvable from the end-user's dependencies, so should be added to your project's `peerDependencies`.

# 0.13.5 / 2016-12-13

**Fixed:**

* Fix bad char in initial Git commit [[#182](https://github.com/insin/nwb/issues/182) by [ntwcklng][ntwcklng]]

# 0.13.4 / 2016-12-11

**Fixed:**

* Fix default test in the `preact-app` skeleton [[#206](https://github.com/insin/nwb/pull/206) by [ntwcklng][ntwcklng]]

# 0.13.3 / 2016-12-10

**Fixed:**

* Fix npm scripts in the `inferno-app` skeleton.

# 0.13.2 / 2016-12-10

**Fixed:**

* Initialise a Git repo for a new project *after* installing dependencies, so package.json includes dependencies saved by npm in the initial commit.

# 0.13.1 / 2016-12-10

**Added:**

* Added a `--copy-files` flag for React component builds to copy files which will not be transpiled over to the build directories [[#58](https://github.com/insin/nwb/issues/58)]

# 0.13.0 / 2016-12-09

**Added:**

- Added new project types: `inferno-app` and `preact-app` - use these with `nwb new` or `nwb init` to develop [Inferno](https://infernojs.com/) and [Preact](https://preactjs.com/) apps [[#194](https://github.com/insin/nwb/issues/194)]
- Added an [`--inferno` flag](https://github.com/insin/nwb/blob/next/docs/Commands.md#build-1) to React app builds to create an [`inferno-compat`](https://github.com/trueadm/inferno/tree/master/packages/inferno-compat) build [[#194](https://github.com/insin/nwb/issues/194)]
- [`react-jsx-source`](https://babeljs.io/docs/plugins/transform-react-jsx-source/) and [`react-jsx-self`](https://babeljs.io/docs/plugins/transform-react-jsx-self/) Babel transforms are now enabled for React apps in development mode for improved debugging.
- A Git repo with an initial commit is now created by default when creating a new project. Pass a `--no-git` flag to disable this.
- Added project-specific variants of `nwb test`: `nwb test-react`, `nwb-test-inferno` and `nwb-test-preact`.
- Added an `audio` loader and an `svg` loader.

**Removed:**

- Removed hardcoded React preset from default Babel config when running tests - instead, `nwb test` will run the new `nwb test-react` command if you have a `react-app` or `react-component` project type in `nwb.config.js`.
- Dependencies are no longer bundled. As a result, Babel 6 dependencies will no longer be deduplicated for npm2 users, so an nwb install will be slower and larger - consider upgrading to npm3 or [yarn](https://yarnpkg.com/) if you can.
- Removed support for deprecated `webpack.plugins` config in `nwb.config.js` - this config must now be moved up into `webpack` instead.

**Changed:**

- Handling of`.svg` files has been moved from the `graphics` loader to the new `svg` loader so inlining can be configured separately. This matters if you're using a [sprite system](http://una.im/svg-icons/), as base64 inlining SVGs breaks [fragment identifiers](https://css-tricks.com/svg-fragment-identifiers-work/).
- Changed `babel-plugin-transform-runtime` configuration to make use of new `moduleName` config; Webpack module resolution no longer uses a blanket fallback to nwb's `node_modules/` for serving and builds.
- [`webpack.uglify` config](https://github.com/insin/nwb/blob/next/docs/Configuration.md#uglify-object--false) can now be set to `false` to disable use of `UglifyJSPlugin` in production builds for debugging [[#160](https://github.com/insin/nwb/issues/160)]

**Dependencies:**

- autoprefixer: v6.4.0 → [v6.5.3](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#653)
- babel-cli: v6.11.4 → v6.18.0
- babel-core: v6.13.2 → v6.20.0
- babel-loader: v6.2.4 → [v6.2.9](https://github.com/babel/babel-loader/blob/master/CHANGELOG.md) - better syntax error messages
- babel-plugin-istanbul: v2.0.0 → [v3.0.0](https://github.com/istanbuljs/babel-plugin-istanbul/blob/master/CHANGELOG.md#300-2016-11-14)
- babel-plugin-lodash: v3.2.8 → [v3.2.10](https://github.com/lodash/babel-plugin-lodash/compare/3.2.8...3.2.10)
- babel-plugin-transform-react-remove-prop-types: v0.2.9 → [v0.2.11](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types/compare/v0.2.9...v0.2.11)
- babel-plugin-transform-runtime: v6.12.0 → [v6.15.0](https://github.com/babel/babel/blob/master/CHANGELOG.md#v6150-2016-08-31) - add `moduleName` config to specify runtime path
- babel-polyfill: v6.13.0 → v6.20.0
- babel-preset-es2015: v6.14.0 → v6.18.0
- babel-preset-es2016: v6.11.3 → v6.16.0
- babel-preset-react: v6.11.1 → v6.16.0
- babel-preset-stage-0: v6.5.0 → v6.16.0
- babel-preset-stage-1: v6.13.0 → v6.16.0
- babel-preset-stage-2: v6.13.0 → v6.18.0
- babel-preset-stage-3: v6.11.0 → v6.17.0
- babel-runtime: v6.11.6 → v6.20.0
- case-sensitive-paths-webpack-plugin: v1.1.3 → v1.1.4 - handle cwd being incorrect case
- copy-webpack-plugin: v3.0.1 → [v4.0.1](https://github.com/kevlened/copy-webpack-plugin/releases)
- css-loader: v0.23.1 → [v0.26.1](https://github.com/webpack/css-loader/compare/v0.23.0...v0.26.1) - cssnano's use of autoprefixer is now disabled by default
- detect-port: v1.0.0 → v1.0.6
- diff: v2.2.3 → [v3.1.0](https://github.com/kpdecker/jsdiff/blob/master/release-notes.md#v310---november-27th-2016)
- figures: v1.7.0 → v2.0.0
- html-webpack-plugin: v2.22.0 → [v2.24.1](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2241)
- inquirer: v1.1.2 → [v2.0.0](https://github.com/SBoudrias/Inquirer.js/releases/tag/v2.0.0)
- glob: v7.0.5 → [v7.1.1](https://github.com/isaacs/node-glob/compare/v7.0.5...v7.1.1)
- karma: v1.2.0 → [v1.3.0](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#130-2016-09-09)
- karma-chrome-launcher: v1.0.1 → [v2.0.0](https://github.com/karma-runner/karma-chrome-launcher/blob/master/CHANGELOG.md#200-2016-08-18) - chromium support
- karma-mocha: v1.1.1 → [v1.3.0](https://github.com/karma-runner/karma-mocha/compare/v1.1.1...v1.23.0)
- karma-mocha-reporter: v2.1.0 → [v2.2.1](https://github.com/litixsoft/karma-mocha-reporter/blob/master/CHANGELOG.md#221-2016-11-18)
- karma-phantomjs-launcher: v1.0.1 → [v1.0.2](https://github.com/karma-runner/karma-phantomjs-launcher/blob/master/CHANGELOG.md#102-2016-08-31) - fix phantomjs path calculation
- mocha: v3.0.2 → [v3.2.0](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#320--2016-11-24)
- phantomjs-prebuilt: v2.1.12 → [v2.1.13](https://github.com/Medium/phantomjs/releases/tag/2.1.13)
- postcss-loader: v0.10.0 → [v1.2.0](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#12)
- qs: v6.2.1 → [v6.3.0](https://github.com/ljharb/qs/blob/master/CHANGELOG.md#630)
- webpack: v1.13.1 → [v1.14.0](https://github.com/webpack/webpack/compare/v1.13.1...v1.14.0) - updated node-libs-browser and uglifyjs versions - `screw_ie8` is now enabled by default; fix for Babel sourcemap issue
- webpack-merge: v0.14.1 → [v1.0.2](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#102--2016-11-29)
- webpack-dev-middleware: v1.6.1 → [v1.8.4](https://github.com/webpack/webpack-dev-middleware/blob/master/CHANGELOG.md#184-2016-10-08)
- webpack-hot-middleware: v2.12.2 → [v2.13.2](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.12.2...v2.13.2)
- whatwg-fetch: v1.0.0 → [v2.0.1](https://github.com/github/fetch/releases) - changes behaviour of `Headers` to be spec-compliant

# 0.12.2 / 2016-09-29

**Removed:**

- Dropped the production `react-constant-elements` transform for now due to bugs.

# 0.12.1 / 2016-09-15

**Experimental:**

- `react run` can now run modules which export a React component or element.

**Added:**

- Added a `reload` option to [Express middleware](https://github.com/insin/nwb/blob/master/docs/Middleware.md#middlewareexpress-options-object) to enable reloading the page if Hot Module Reloading is unsuccessful [[#168](https://github.com/insin/nwb/issues/168)]

# 0.12.0 / 2016-08-16

**Breaking Changes:**

- **Dropped Node.js 0.12 support**

  Based on the `engines` config of nwb's dependencies, Node.js 4.2.0 is now the minimum required version.
- **Upgraded from Babel 5 to Babel 6** [[#12](https://github.com/insin/nwb/issues/12)] [[#31](https://github.com/insin/nwb/issues/31)] [[@geowarin](https://github.com/geowarin/)]

  Babel 6 introduced [a number of breaking changes](https://github.com/babel/babel/blob/master/CHANGELOG.md#600) which you may need to account for in your codebase if you're using nwb or were otherwise using Babel 5.

  [`babel` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#babel-configuration) in `nwb.config.js` is **no longer directly equivalent to what you would put in a [`.babelrc` file](https://babeljs.io/docs/usage/babelrc/)**.
- **Added support for long-term caching** [[#73](https://github.com/insin/nwb/issues/73)]

  A deterministic hash is now included in the filenames of generated `.js` and `.css` files.

  The Webpack manifest (required for module loading) is now extracted and automatically injected prior to the `</body>` tag, so **your HTML template *must* have a `</body>` tag**.

  **If you do any post-build processing on generated files it might need to be updated**, as production app builds will now generate files as `[name].[hash].[ext]` instead of `[name].[ext]`.
- **Dropped support for the `.jsx` extension**

  [It's dead, Jim](https://github.com/facebookincubator/create-react-app/issues/87#issuecomment-234627904).

  > You can use [`webpack.loaders` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#loaders-object) to set `/\.jsx?$/` as `babel-loader`'s `test` config and [`webpack.extra config`](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#extra-object) to add `.jsx` back to the `resolve.extensions` list if you're using `.jsx` files and can't reasonably migrate away.
- **Dropped `build-module` and `build-umd/clean-umd`commands**

  These were a confusing middle layer which split the implementation of building a React component or browser-focused npm module in two. They both required a config file to provide a project `type` for nwb to figure out what to do.

  They've been **replaced with `build-react-component` and `build-web-module` commands**, which are now used in `package.json` `scripts` in the corresponding project skeletons.

  As a result **having a config file is now optional for all project types**. If you don't need configuration, you can delete the `nwb.config.js` file created as a convenience by project skeletons.

  A config file is now only required if you want to use the generic `build`, `clean` and `serve` commands.
- **Changed ES6 module build directory from `es6/` to `es/`**

  Upgrade steps:

  - Replace `"es6/index.js"` with `"es/index.js"` in `package.json` `"jsnext:main"` config
  - Also add `"module": "es/index.js"`, as this is part of [a proposal for native module support](https://github.com/dherman/defense-of-dot-js/blob/master/proposal.md) which is being supported by multiple bundlers.
  - Replace `"es6"` with `"es"` in `package.json` `files` config

- **Dropped `webpack.vendorBundle` config in favour of a `--no-vendor` flag**

  Making this feature toggle a command line argument makes it easier to try, and to combine with other feature toggles like `--preact`.

  Tweak your `package.json` `"build"` script instead if you were using `webpack.vendorBundle: false` config:

  ```json
  {
    "scripts": {
      "build": "nwb build-react-app --no-vendor"
    }
  }
  ```

**`nwb.config.js` Config Format Changes:**

- **`build` config is deprecated in favour of new [`npm` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#npm-object)**, which is a slightly different format.

  nwb will adapt any `build` config it finds for the current build and log out the equivalent `npm` config.

  ```
  // < v0.12                             // v0.12
  module.exports = {                     module.exports = {
    build: {                         =>    npm: {
      jsNext: true,                          esModules: true,
      umd: true,                     =>      umd: {
      global: 'MyComponent',                   global: 'MyComponent',
      externals: {'react': 'React'}            externals: {'react': 'React'}
    }                                        }
  }                                        }
                                         }
  ```
  ```
  // < v0.12               // v0.12 - simple UMD config without externals
  module.exports = {       module.exports = {
    build: {           =>    npm: {
      jsNext: true,            esModules: true,
      umd: true,       =>      umd: 'myLib'
      global: 'MyLib'        }
    }                      }
  }
  ```

- **The Babel [runtime transform](https://babeljs.io/docs/plugins/transform-runtime/) is now configured using new [`babel.runtime` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#runtime-string--boolean)** instead of Babel 5's `optional` config.

  **The runtime transform is now partially-enabled by default** to support use of `async`/`await` and generators, so update your configuration accordingly. nwb will adapt `['runtime']` config for the current build by converting it to `true`.

  ```
  // < v0.12                     // v0.12 - enabled by default for regenerator
  module.exports = {
    babel: {
      optional: ['runtime']  =>  // You can remove your config if you were
    }                            // using it for async/await or generators
  }
  ```
  ```
  // < v0.12                     // v0.12 - also import helpers from
  module.exports = {             module.exports = {
    babel: {                       babel: {
      optional: ['runtime']  =>      runtime: 'helpers'
    }                              }
  }                              }
  ```

-  **[`babel.loose` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#loose-boolean) is now Boolean** instead of Babel 5's string config.

  **[Loose mode](http://www.2ality.com/2015/12/babel6-loose-mode.html) is now enabled by default**, so `loose` config is only used if you need to disable loose mode.

  ```
  // < v0.12              // v0.12 - enabled by default
  module.exports = {
    babel: {
      loose: 'all'    =>  (none)
    }
  }
  ```
  ```
  // < v0.12 - loose mode not used      // v0.12 - disabling loose mode
                                        module.exports = {
                                          babel: {
  (none)                            =>      loose: false
                                          }
                                        }
  ```

- **`karma.tests` config is deprecated in favour of new [`karma.testContext`](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#testcontext-string) and [`karma.testFiles` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#testfiles-string--arraystring)**, depending on which was being specified. If `karma.tests` is present, nwb will attempt to detect the appropriate new config to use it for, or will otherwise fall back to the new default config.

  ```
  // < v0.12                         // v0.12 - using a Webpack context module
  module.exports = {                 module.exports = {
    karma: {                           karma: {
      tests: 'tests.webpack.js'  =>      testContext: 'tests.webpack.js'
    }                                  }
  }                                  }
  ```
  ```
  // < v0.12                         // v0.12 - custom test file glob
  module.exports = {                 module.exports = {
    karma: {                           karma: {
      tests: 'test/**.test.js'   =>      testFiles: 'test/**.test.js'
    }                                  }
  }                                  }
  ```

**Developer Experience Improvements:**

- **Added a `check-config` command which checks your nwb configuration file** for errors and deprecated usage, and provides some usage hints (e.g. where more convenient config is available).

  Run this after upgrading your nwb version and it will tell you what needs to be changed.
- **New user-friendly output for Webpack builds based on [create-react-app](https://github.com/facebookincubator/create-react-app)'s**.

  This provides friendlier error and warning reporting, reports the gzipped size of generated files and uses a persistent console for development server logging.

  **Windows Note:** running a development server will clear the current screen in your console - in Windows the escape codes used to do this have the unfortunate effect of clearing *all* the scrollback history in your current console.

  To avoid this **use the `start` command to spawn a new command window when running the development server in Windows**, e.g.:

  ```
  start npm start
  start react run app.js
  ```
- **Apps can now use `fetch`, `async`/`await` and generators out of the box without any configuration.**

  `Promise`, `fetch`, `Object.assign` polyfills and the regenerator runtime are now provided by default.
- You can now **transform destructured imports to cherry-picked imports for specified modules** using new [`babel.cherryPick` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#cherrypick-string--arraystring) [[#141](https://github.com/insin/nwb/issues/141)]
- Case-sensitivity of `require`/`import` paths is now enforced by [`CaseSensitivePathsPlugin`](https://github.com/Urthen/case-sensitive-paths-webpack-plugin), avoiding an easy-to-overlook cause of CI build failure if you don't develop on Linux.
- If the intended dev server port is not available, you will now be prompted to continue with a different, free port.

**React App Optimisations:**

- **Production React builds now remove `propTypes` from ES6 class and stateless functional components** (but not from your dependencies) using [react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types) [[#97](https://github.com/insin/nwb/issues/97)]

- **Added a [`--preact` flag](https://github.com/insin/nwb/blob/0.12/docs/Commands.md#build-1)** to React app builds to create a [`preact-compat`](https://github.com/developit/preact-compat) build.

  This is an easy way to try [Preact](https://preactjs.com/) with your React apps, resulting in a much smaller bundle if your app is compatible [[#124](https://github.com/insin/nwb/issues/124)]

**Babel:**

- **nwb implements its own support for a Babel 6 equivalent of Babel 5's `stage` configuration** to [choose which experimental features are enabled](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#stage-number--false), including defaulting to [Stage 2](https://babeljs.io/docs/plugins/preset-stage-2/).

  For stage 2 and below, **decorators can be use by default**, as nwb will include the [Babel Legacy Decorator transform plugin](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy). See [the plugin's Best Effort documentation](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy#best-effort) for differences you will need to take into account if you were using Babel 5 decorators.
- **nwb preserves CommonJS interop for apps and component ES5 builds** using the [`add-module-exports`](https://github.com/59naga/babel-plugin-add-module-exports) plugin.

  This means a `.default`doesn't need to be tagged on when you're using `require()` with Webpack's code-splitting, or when people import your npm modules using `require()` directly.

  Babel 6 removed interop with CommonJS exports, as it allowed you to write broken ES6 code. Kent C. Dodds has [a post about this which is well worth reading](https://medium.com/@kentcdodds/misunderstanding-es6-modules-upgrading-babel-tears-and-a-solution-ad2d5ab93ce0) to understand what *not* to do.
- **[Loose mode](http://www.2ality.com/2015/12/babel6-loose-mode.html) is now enabled by default.**
- **Changed [`babel.loose` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#loose-boolean) to Boolean**.

  This is now only needed if you want to disable loose mode (e.g. in non-production environments to check for ES6 compliance errors in normal mode).
- **Added [`babel.runtime` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#runtime-string--boolean)** to configure the Babel runtime transform, replacing Babel 5's `optional` config.

  This is turned on by default, configured to import the regenerator runtime when `async`/`await` or generators are used.
- **Removed the inline element transform optimisation for React app production builds**, as the Babel 6 version of it currently depends on polyfilling `Symbol`.

**Karma:**

- **Changed default testing configuration** to support co-location of tests and a wider range of test file names and locations. This should be backwards-compatible with the previous defaults.
  - Test files included by default are now `-test.js`, `.test.js` or `.spec.js` files anywhere underneath a `src/`, `test/` or `tests/` directory.
  - Code coverage also ignores all code underneath `test/`, `tests/` or any `__tests__/` directory inside `src/` by default, as well as test files.
- **Added [`karma.browsers` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#browsers-string--arrayplugin)** to customise which browsers tests are run in.

  The plugin to support use of `'Chrome'` in this config is also available by default.
- **Added [`karma.testDirs` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#testdirs-string--arraystring)** to control which directories are excluded from code coverage reporting.
- **[`babel-plugin-istanbul`](https://github.com/istanbuljs/babel-plugin-istanbul) is now used to instrument code for test coverage** instead of `isparta-loader`.

**Webpack:**

*Default Loader Config*

- **Disabled `css-loader`'s use of Autoprefixer** - nwb's PostCSS configuration is now the only source of prefix addition and removal [[#132](https://github.com/insin/nwb/issues/132)]
- All static file loaders now use `url-loader` (which falls back to `file-loader`) to allow you to configure inlining for any group of static files if needed.
- **Changed default `limit` config for all static file loaders to `1`**, effectively disabling inlining by default - if you want resources smaller than a given size to be inlined, configure `limit` using [`webpack.loaders` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#loaders-object).
- Moved handling of `.svg` files from the `fonts` loader to the `graphics` loader.
- Moved handling of `.eot` files to the `fonts` loader and removed the `eot` loader.
- Added a `video` loader for `.mp4'`, `.ogg` and `.webm`.
- Added `.webp` to the `graphics` loader.

*Default Plugin Config*

- **Updated default `UglifyJsPlugin` options** to strip comments from output and use the `screw_ie8` setting in every minification step.

*Configuration*

- **Added [`webpack.aliases` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#aliases-object)** to set up module resolving aliases, as a convenient alternative to using `webpack.extra.resolve.alias` [[#125](https://github.com/insin/nwb/issues/125)]
- **Added [`webpack.autoprefixer` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#autoprefixer-string--object)** to configure Autoprefixer in nwb's default PostCSS configuration [[#132](https://github.com/insin/nwb/issues/132)]
- **Added [`webpack.publicPath` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#publicpath-string)** to set up or clear the path/URL used for static resources, as a convenient alternative to using `webpack.extra.output.publicPath`.
- **Added [`webpack.uglify` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#uglify-object)** to allow customisation of Webpack `UglifyJsPlugin` options.
- **[`webpack.compat` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#compat-object) now supports `'json-schema': true`** to prevent a transitive [`json-schema`](https://github.com/kriszyp/json-schema) dependency breaking Webpack builds. This usually manifests itself as an `Uncaught Error: define cannot be used indirect` error.
- **Generated `module.noParse` config is now an `Array`**, so any user-provided config for it in `webpack.extra` (which should also be specified as an `Array`) can now be merged into it.

**npm Build:**

- When creating a project with an ES6 modules build enabled, a `"module"` property will be added to the project's `package.json` as well as `"jsnext:main"` [[#137](https://github.com/insin/nwb/issues/137)]

  This is the default property Webpack 2 uses to look for an ES6 modules build.
- `build` config is deprecated in favour of new [`npm` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#npm-object).
- **React component builds now wrap `propTypes` for ES6 class and stateless functional components with an environment check** -  `if (process.env.NODE_ENV !== 'production')` - so they'll automatically be stripped from the production build in apps which use them. [[#145](https://github.com/insin/nwb/issues/145)]

  `propTypes` will be stripped from the minified UMD build.

  This can be disabled by passing a `--no-proptypes` flag.
- Building a React demo app during a React component build can now be skipped by passing a `--no-demo` flag [[#155](https://github.com/insin/nwb/issues/155)]

**Other Configuration:**

- **Fallback index serving for HTML5 History apps is now enabled by default** in the development server. This can be disabled by passing a `--no-fallback` flag.
- **Added [`polyfill` config](https://github.com/insin/nwb/blob/0.12/docs/Configuration.md#polyfill-boolean)** to disable default polyfilling of `Promise` and `fetch` for apps if you don't need it and want to shave a few KB off your build.
- **The dev server port can now be specified via a `PORT` environment variable**. The CLI `--port` takes precedence if both are provided.

**CLI:**

- Added a `nwb check-config` command.
- CLI now uses spinners for build commands, with gzipped filesize logging.
- **Reworked build commands for React components and npm modules** to remove a needless middle layer and add specific build commands for these project types.
- **Removed the `-g, --global` argument for enabling a UMD build** when creating a React component or web module project, in favour of passing a name to the `--umd` argument instead.
- **Removed the `--info` flag for showing webpack output**, as this is now handled in a more developer-friendly manner.

**Starter Projects:**

- The react-app project skeleton now includes examples of importing CSS and images.
- Required `<meta>` tags in HTML templates are now all first thing in `<head>`.
- Added `shrink-to-fit=no` to the `viewport` `<meta>` tag in HTML templates for Safari.

**Dependencies:**

- autoprefixer: v6.3.6 → [v6.4.0](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#640)
- babel\* v5 → babel\* v6
- [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul/): v2.0.0
- [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash): v3.2.8
- [babel-plugin-transform-react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types): v0.2.9
- [case-sensitive-paths-webpack-plugin](https://github.com/Urthen/case-sensitive-paths-webpack-plugin): v1.1.3
- connect-history-api-fallback: v1.2.0 → [v1.3.0](https://github.com/bripkens/connect-history-api-fallback/blob/master/CHANGELOG.md#v130) - allow disabling of the dot rule
- copy-template-dir: v1.2.1 → v1.3.0 - support vars in filenames
- expect: v1.20.1 → [v1.20.2](https://github.com/mjackson/expect/compare/v1.20.1...v1.20.2)
- express: v4.13.4 → [v4.14.0](https://github.com/expressjs/express/blob/master/History.md#4140--2016-06-16)
- [figures](https://github.com/sindresorhus/figures): v1.7.0
- file-loader: v0.8.5 → [v0.9.0](https://github.com/webpack/file-loader/compare/v0.8.5...v0.9.0)
- glob: v7.0.3 → [v7.0.5](https://github.com/isaacs/node-glob/compare/v7.0.3...v7.0.5)
- html-webpack-plugin: v2.19.0 → [v2.22.0](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2220)
- inquirer: v1.0.3 → [v1.1.2](https://github.com/SBoudrias/Inquirer.js/compare/v1.0.3...v1.1.2)
- karma: v0.13.22 → [v1.2.0](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#120-2016-08-11)
- karma-chrome-launcher v1.0.1
- karma-coverage: v1.0.0 → [v1.1.1](https://github.com/karma-runner/karma-coverage/blob/master/CHANGELOG.md#111-2016-07-23)
- karma-mocha-reporter: v2.0.3 → [v2.1.0](https://github.com/litixsoft/karma-mocha-reporter/compare/v2.0.3...v2.1.0)
- karma-phantomjs-launcher: v1.0.0 → [v1.0.1](https://github.com/karma-runner/karma-phantomjs-launcher/blob/master/CHANGELOG.md#101-2016-06-23)
- karma-webpack: v1.7.0 → [v1.8.0](https://github.com/webpack/karma-webpack/blob/master/CHANGELOG.md#180-2016-08-07) - remove dist from scm
- mocha: v2.5.3 → [v3.0.2](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#302--2016-08-08)
- npm-install-webpack-plugin: v4.0.1 → [v4.0.4](https://github.com/ericclemmons/npm-install-webpack-plugin/blob/master/CHANGELOG.md#404-2016-06-30)
- phantomjs-prebuilt: v2.1.7 → v2.1.12 - npm packaging fun
- postcss-loader: : v0.9.1 → [v0.10.0](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#0100)
- qs: v6.2.0 → [v6.2.1](https://github.com/ljharb/qs/blob/master/CHANGELOG.md#621)
- rimraf: v2.5.2 → [v2.5.3](https://github.com/isaacs/rimraf/compare/v2.5.2...v2.5.3)
- [webpack-fail-plugin](https://github.com/TiddoLangerak/webpack-fail-plugin): v1.0.5
- webpack-hot-middleware: v2.10.0 → [v2.12.2](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.10.0...v2.12.2)
- [webpack-md5-hash](https://github.com/erm0l0v/webpack-md5-hash): v0.0.5
- webpack-merge: v0.14.0 → [v0.14.1](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#0141--2016-07-25)

# 0.11.1 / 2016-07-16

**Fixed:**

- PostCSS config was not being created for the vendor/`node_modules/` loader for CSS preprocessor plugins [[#129](https://github.com/insin/nwb/issues/129)]

# 0.11.0 / 2016-06-08

**Breaking Changes:**

- Replaced the deprecated `autoprefixer-loader` with `postcss-loader` in default style pipelines - it's configured to do the same autoprefixing by default [[#57](https://github.com/insin/nwb/issues/57)]
  - If you were configuring vendor prefixing using `webpack.loaders.autoprefixer`, you will now need to manage an `autprefixer` dependency yourself and use [`webpack.postcss`](https://github.com/insin/nwb/blob/0.11/docs/Configuration.md#postcss-object) to perform this configuration.

**`nwb.config.js` Config Format Changes:**

* `webpack.plugins` is deprecated - config under `webpack.plugins` should be moved up into `webpack` instead. Having certain config under a `plugins` prop was an implementation detail which wasn't relevant to end-users [[#113](https://github.com/insin/nwb/issues/113)]

  ```js
  // < v0.11
  module.exports = {
    webpack: {
      plugins: {
        define: {...},
        html: {...}
      }
    }
  }
  ```
  ```js
  // v0.11
  module.exports = {
    webpack: {
      define: {...},
      html: {...}
    }
  }
  ```
* Support for flatter [Webpack loader configuration](https://github.com/insin/nwb/blob/0.11/docs/Configuration.md#loaders-object) was added. Having a `query` object is now optional - loader query configuration can now be placed directly under the loader's id [[#113](https://github.com/insin/nwb/issues/113)]

  ```js
  // < v0.11
  module.exports = {
    webpack: {
      loaders: {
        css: {
          query: {
            modules: true
          }
        }
      }
    }
  }
  ```
  ```js
  // v0.11
  module.exports = {
    webpack: {
      loaders: {
        css: {
          modules: true
        }
      }
    }
  }
  ```

**Added:**

- Installing globally now adds a `react` command for quick React development starting from a single file.
  - `react run entry.js` runs a development server.
  - `react build entry.js` creates a static build.
  - For these commands, Babel is preconfigured to allow you to use all of its Stage 0 features out of the box, including `async`/`await`.
  - These are implemented by (the previously undocumented) `serve-react` and (new) `build-react` nwb commands.
- The entry point for apps and npm module UMD builds can now be specified as an argument to [`build` and `serve` commands](https://github.com/insin/nwb/blob/0.11/docs/Commands.md#project-type-specific-commands). The default is still `src/index.js`. [[#115](https://github.com/insin/nwb/issues/115)]
- The directory web apps are built into can now be specified as an argument to [`build`, `clean` and `serve` commands](https://github.com/insin/nwb/blob/0.11/docs/Commands.md#project-type-specific-commands). The default is still `dist/`.
- Added [`webpack.compat` config](https://github.com/insin/nwb/blob/0.11/docs/Configuration.md#compat-object) to enable compatibility tweaks for modules which are known to be problematic with Webpack - initially this includes support for Enzyme, Moment.js and Sinon.js 1.x [[#108](https://github.com/insin/nwb/issues/108)]
- Added [`webpack.postcss` config](https://github.com/insin/nwb/blob/0.11/docs/Configuration.md#postcss-array--object) to customise the PostCSS plugins applied to each style pipeline [[#57](https://github.com/insin/nwb/issues/57)]
- Added [`webpack.vendorBundle` config](https://github.com/insin/nwb/blob/0.11/docs/Configuration.md#vendorbundle-boolean) to disable automatically extracting anything imported from `node_modules/` out into a separate `vendor` chunk [[#106](https://github.com/insin/nwb/issues/106)]
- Added [documentation for creating and using a test context module](https://github.com/insin/nwb/blob/0.11/docs/Testing.md#using-a-test-context-module) if there's code you need to run prior to tests running, such as configuring your assertion library with additional assertions.
- Added a `--config` option to allow you to specify your own config file instead of `nwb.config.js`.

**Changed:**

- Apps are no longer required to provide their own HTML template. The default template path of `src/index.html` will continue to be used if a file exists there. If an alternative template is not provided via [`webpack.html` config](https://github.com/insin/nwb/blob/0.11/docs/Configuration.md#html-object), nwb will now fall back to using a basic template.
- Restored default use of the Babel polyfill in Karma config so tests (and their dependencies) can assume a modern environment.
- Default `babel-loader` config now uses [`cacheDirectory: true` for a speedup](https://github.com/babel/babel-loader#babel-loader-is-slow).
- Improved debug output (activated with a `DEBUG=nwb` environment variable) to print config objects in full - if you're configuring plugin objects (e.g. PostCSS plugins), it's recommended to create instances of them if you want to use debug output.
- `webpack.optimize.DedupePlugin` is now only used for production builds, as recommended in the Webpack docs.

**Dependencies:**

- diff: v2.2.2 → [v2.2.3](https://github.com/kpdecker/jsdiff/blob/master/release-notes.md#v223---may-31st-2016)
- html-webpack-plugin: v2.17.0 → [v2.19.0](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2190)
- inquirer: v1.0.2 → [v1.0.3](https://github.com/SBoudrias/Inquirer.js/compare/v1.0.2...v1.0.3)
- mocha: v2.4.5 → [v2.5.3](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#253--2016-05-25)
- npm-install-webpack-plugin: v3.1.2 → [v4.0.1](https://github.com/ericclemmons/npm-install-webpack-plugin/blob/master/CHANGELOG.md#401-2016-06-06) - saving is on by default and [a new `dev` option controls](https://github.com/ericclemmons/npm-install-webpack-plugin#usage) where installed dependencies get saved to
- [postcss-loader](https://github.com/postcss/postcss-loader): v0.9.1
- redbox-noreact: v1.0.0 → [v1.1.0](https://github.com/insin/redbox-noreact/blob/master/CHANGES.md#110--2016-05-29)
- webpack: v1.13.0 → [v1.13.1](https://github.com/webpack/webpack/compare/v1.13.0...v1.13.1)
- webpack-merge: v0.12.0 → [v0.14.0](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#0140--2016-06-05)

# 0.10.0 / 2016-05-16

**Breaking Changes:**

- React v15 is now installed into React app/component skeletons by default.

**Changed:**

- Default Karma config now includes `showDiff: true` config for the default Mocha reporter.
- The dev server now logs an initial `webpack building...` message so you know you're waiting for the initial build.
- npm scripts in the skeletons generated for `react-app` and `web-app` projects now use project type-specific commands, so the `nwb.config.js` included with them can be deleted if you don't need any config tweaks.
- nwb now passes the `--save` option to npm when installing React dependencies, to honour any npm [save-exact](https://docs.npmjs.com/misc/config#save-exact) (recommended!) or [save-prefix](https://docs.npmjs.com/misc/config#save-exact) config you have set.

**Added:**

- Extra Karma config can now be configured via a `karma.extra` Object.
- Added a `--react` option to allow you to set the version of React which will be installed when creating apps or components. This defaults to whatever the stable version of React was when the version of `nwb` you're using was released.

**Dependencies:**

- chalk: v1.1.1 → [v1.1.3](https://github.com/chalk/chalk/compare/v1.1.1...v1.1.3) - update deps
- cross-spawn: v2.1.5 → [v2.2.3](https://github.com/IndigoUnited/node-cross-spawn/compare/2.1.5...2.2.3) - update deps
- [detect-port](https://github.com/xudafeng/detect-port/): v1.0.0
- expect: v1.16.0 → [v1.20.1](https://github.com/mjackson/expect/blob/master/CHANGES.md#v1201)
- html-webpack-plugin: v2.14.0 → [v2.17.0](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2170)
- inquirer: v0.12.0 → [v1.0.2](https://github.com/SBoudrias/Inquirer.js/compare/v0.12.0...v1.0.2) - switch to Promise-based API
- karma-coverage: v0.5.5 → [v1.0.0](https://github.com/karma-runner/karma-coverage/compare/v0.5.5...v1.0.0)
- karma-mocha: v0.2.2 → [v1.0.1](https://github.com/karma-runner/karma-mocha/compare/v0.2.2...v1.0.1)
- karma-mocha-reporter: v2.0.0 → [v2.0.3](https://github.com/litixsoft/karma-mocha-reporter/compare/v2.0.0...v2.0.3)
- npm-install-webpack-plugin: v3.0.0 → [v3.1.2](https://github.com/ericclemmons/npm-install-webpack-plugin/blob/master/CHANGELOG.md#v312-2016-05-12) [[#77](https://github.com/insin/nwb/issues/77)]
- phantomjs-prebuilt: v2.1.6 → [v2.1.7](https://github.com/Medium/phantomjs/releases/tag/v2.1.7)
- qs: v6.1.0 → [v6.2.0](https://github.com/ljharb/qs/blob/master/CHANGELOG.md#620)
- webpack: v1.12.14 → [v1.13.0](https://github.com/webpack/webpack/compare/v1.12.14...v1.13.0)
- webpack-merge: v0.8.4 → [v0.12.0](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#0120--2016-04-19)

# 0.9.2 / 2016-03-27

**Dependencies:**

- webpack-dev-middleware: v1.6.0 → [v1.6.1](https://github.com/webpack/webpack-dev-middleware/compare/v1.6.0...v1.6.1) - fixes request path issue introduced in 1.6.0

# 0.9.1 / 2016-03-26

**Fixed:**

- `style-loader` was not being specified to apply styles from additional chunks when extracting CSS.

# 0.9.0 / 2016-03-26

**Breaking Changes:**

- Changes to how React and plain JS web apps are built:
  - Builds are now generated in `dist/` instead of `public/build/`
  - `index.html` for builds is now generated based on a template in `src/index.html`, instead of using a static `public/index.html` [[#34](https://github.com/insin/nwb/issues/34)]

    **Upgrading existing projects:**

    - move your `public/index.html` to `src/index.html` and delete the `<link>` and `<script>` tags for `vendor` and `app` resources. These will now be injected at build time.
    - replace `/public/build` in your `.gitignore` with `/dist/`

  - `public/` is now only for public files - any contents in this directory will now be copied to `dist/` at the start of a build. The development server will also serve static content from `public/`.

**Removed:**

- Backwards compatibility for `nwb.config.js` format changes made in 0.8 has been removed.

**Added:**

- Added a `--host` option when running the dev server [[#50](https://github.com/insin/nwb/issues/50)]
- `ExtractTextPlugin` (used to extract CSS when building) can now be configured using `webpack.plugins.extractText` config - this allows you to configure the `allChunks` setting if you want all CSS to be extracted when using code splitting.
- `HtmlWebpackPlugin` (used to generate an `index.html` when building) can now be configured using `webpack.plugins.html` config.

**Changed:**

- `breakConfig: true` has been added to default `babel-loader` config to avoid `.babelrc` files being resolved by Babel - all Babel configuration is expected to be in `nwb.config.js` [[#63](https://github.com/insin/nwb/issues/63)]
- Static resources handled by Webpack's `file-loader` now include a hash in their filenames for cachebusting when they change [[#38](https://github.com/insin/nwb/issues/38)]

**Dependencies:**

- babel: v5.8.34 → v5.8.38 - left-pad transitive dependency drama
- babel-core: v5.8.34 → v5.8.38 - left-pad transitive dependency drama
- connect-history-api-fallback: v1.1.0 → v1.2.0 - support custom `Accept` headers
- copy-template-dir: v1.2.0 → v1.2.1 - support large template folders
- expect: v1.14.0 → [v1.16.0](https://github.com/mjackson/expect/compare/v1.14.0...v1.16.0) - mostly packaging changes?
- glob: v7.0.0 → [v7.0.3](https://github.com/isaacs/node-glob/compare/v7.0.0...v7.0.3) - misc fixes
- html-webpack-plugin: v2.9.0 → [v2.14.0](https://github.com/ampedandwired/html-webpack-plugin/blob/master/CHANGELOG.md#v2140)
- karma: v0.13.21 → [v0.13.22](https://github.com/karma-runner/karma/releases/tag/v0.13.22) - removed a large test file from npm package
- karma-coverage: v0.5.3 → [v0.5.5](https://github.com/karma-runner/karma-coverage/blob/master/CHANGELOG.md#055-2016-03-07) - bug fixes
- karma-mocha-reporter: v1.2.3 → [v2.0.0](https://github.com/litixsoft/karma-mocha-reporter/compare/v1.2.3...v2.0.0) - add karma to peerDeps; wait for all browsers to run
- npm-install-webpack-plugin: v2.0.2 → [v3.0.0](https://github.com/ericclemmons/npm-install-webpack-plugin/blob/master/CHANGELOG.md#300-2016-03-07) - `resolve.alias` and `resolve.root` support [[#83](https://github.com/insin/nwb/issues/83)]
- phantomjs-prebuilt: v2.1.4 → v2.1.6 - minor fixes to custom CA handling
- react-transform-hmr: v1.0.2 → [v1.0.4](https://github.com/gaearon/react-transform-hmr/releases/tag/v1.0.4) - update react-proxy to fix a few correctness issues
- style-loader: v0.13.0 → [v0.13.1](https://github.com/webpack/style-loader/compare/v0.13.0...v0.13.1) - add query to style/useable
- webpack-dev-middleware: v1.5.1 → [v1.6.0](https://github.com/webpack/webpack-dev-middleware/compare/v1.5.1...v1.6.0)
- webpack-hot-middleware: v2.7.1 → [v2.10.0](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.7.1...v2.10.0) - improved error overlay styling
- webpack-merge: v0.7.3 → [v0.8.4](https://github.com/survivejs/webpack-merge/blob/master/CHANGELOG.md#084--2016-03-17) - change merging behavior so only loaders get prepended

# 0.8.1 / 2016-03-03

**Dependencies:**

- karma-mocha-reporter: v1.2.2 → [v1.2.3](https://github.com/litixsoft/karma-mocha-reporter/compare/v1.2.2...v1.2.3) - don't fail test suites containing skipped tests

# 0.8.0 / 2016-02-26

**Breaking Changes:**

- [`npm-install-webpack-plugin`](https://github.com/ericclemmons/npm-install-webpack-plugin) is now used instead of `npm-install-loader` to implement `nwb serve --auto-install`.

  If you were configuring automatic npm installation using a `loaders.install.query.cli` config object, this should be moved to `webpack.plugins.install` instead.

**`nwb.config.js` Config Format Changes:**

* React component and vanilla JS module npm build configuration must now be specificed as a `build` object:

  ```js
  // < v0.9
  module.exports = {
    type: 'react-component',
    externals: {react: 'React'},
    global: 'MyComponent',
    jsNext: true,
    umd: true
  }
  ```
  ```js
  // v0.9
  module.exports = {
    type: 'react-component',
    build: {
      externals: {react: 'React'},
      global: 'MyComponent',
      jsNext: true,
      umd: true
    }
  }
  ```
* Webpack configuration must now be specified as a `webpack` object:

  ```js
  // < v0.9
  module.exports = {
    type: 'react-app',
    loaders: {
      css: {
        query: {
          modules: true
        }
      }
    }
  }
  ```
  ```js
  // v0.9
  module.exports = {
    type: 'react-app',
    webpack: {
      loaders: {
        css: {
          query: {
            modules: true
          }
        }
      }
    }
  }
  ```
* Webpack `define` config must now be specified in a `plugins` object:

  ```js
  // < v0.9
  module.exports = {
    type: 'react-app',
    define: {
      __VERSION__: JSON.stringify(require('./package.json').version)
    }
  }
  ```
  ```js
  // v0.9
  module.exports = {
    type: 'react-app',
    webpack: {
      plugins: {
        define: {
          __VERSION__: JSON.stringify(require('./package.json').version)
        }
      }
    }
  }
  ```
* All "extra" Webpack config must be specified in a an `extra` object, including extra loaders. The new object must correspond with Webpack's config file layout.

  ```js
  // < v0.9
  module.exports = {
    type: 'react-app',
    loaders: {
      extra: [/* ... */]
    }
  }
  ```
  ```js
  // v0.9
  module.exports = {
    type: 'react-app',
    webpack: {
      extra: {
        module: {
          loaders: [/* ... */]
        }
      }
    }
  }
  ```

**Changes:**

- `nwb.config.js` is now only required when running generic build commands: `build`, `clean`, `serve`, `test`
  - `type` config is only required when running a generic build command, but if provided it must be valid.
- Karma tests now always run just once in a CI environment regardless of the `--server` flag - this allows you to use `--server` in your default `npm test` command if you want to, without needing a separate run script for CI.
- Development instructions in project skeletons were moved from `README.md` to a `CONTRIBUTING.md` file, and are now documented using `npm` and `npm run` commands instead of global `nwb` commands.
- All commands are now run in the current working directory - you no longer need to `require.resolve()` full paths to extra Babel plugins configured in `nwb.config.js`, just use their names as normal and Babel will now be able to import them.
- Upgraded to PhantomJS v2 for Karma tests.
  - Babel polyfills are no longer included in Webpack config for Karma, as PhantomJS v2 uses a more recent version of WebKit.

**Added:**

- Extra webpack config can now be configured via a `webpack.extra` Object.
  - To support adding other webpack built-in plugins via `extra`, if a function is exported from `nwb.config.js`, it will now be called with an object containing the following properties:
    - `command` - the nwb command being executed
    - `webpack` - the webpack module (for configuring extra plugins using nwb's version of webpack)
- Project type-specific versions of the `build`, `clean` and `serve` commands are now officially documented for direct use.
- A `test:watch` npm script was added to project template `package.json`.

**Dependencies:**

- autoprefixer-loader: v3.1.0 → v3.2.0
- cross-spawn: v2.1.4 → [v2.1.5](https://github.com/IndigoUnited/node-cross-spawn/compare/2.1.4...2.1.5) - update `which` dependency (minor)
- expect: v1.13.4 → [v1.14.0](https://github.com/mjackson/expect/blob/master/CHANGES.md#v1140) - new features
- express: v4.13.3 → v4.13.4 - deps
- extract-text-webpack-plugin: v0.9.1 → [v1.0.1](https://github.com/webpack/extract-text-webpack-plugin/compare/v0.9.1...v1.0.1) - use webpack-sources
- glob: v6.0.3 → v7.0.0 - throw if cwd is not a directory
- html-webpack-plugin: v1.7.0 → v2.9.0
- inquirer: v0.11.2 → [v0.12.0](https://github.com/SBoudrias/Inquirer.js/compare/v0.11.2...v0.12.0)
- karma: v0.13.18 → v0.13.21 - socket.io 1.4.5 seems to have fixed the post-test hanging issue, [bug fixes and new features](https://github.com/karma-runner/karma/releases/tag/v0.13.20)
- karma-mocha: v0.2.1 → [v0.2.2](https://github.com/karma-runner/karma-mocha/compare/v0.2.1...v0.2.2)
- karma-mocha-reporter: v1.1.5 → [v1.2.2](https://github.com/litixsoft/karma-mocha-reporter/compare/v1.1.5...v1.2.2) - add diff output for failed tests
- karma-phantomjs-launcher: v0.2.3 → [v1.0.0](https://github.com/karma-runner/karma-phantomjs-launcher/blob/master/CHANGELOG.md#100-2016-01-28) - use phantomjs-prebuild
- mocha: v2.3.4 → [v2.4.5](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#245--2016-01-28)
- phantomjs v1.9.19 → phantomjs-prebuilt v2.1.4 - update installer to PhantomJS 2.x, renamed package
- qs: v5.2.0 → [v6.1.0](https://github.com/ljharb/qs/blob/master/CHANGELOG.md#610) - revert ES6 requirement, new `allowDots` option and some fixes
- react-transform-catch-errors: v1.0.1 → v1.0.2 - remove some files from the npm package
- react-transform-hmr: v1.0.1 → v1.0.2 - remove some files from the npm package
- resolve: v1.1.6 → [v1.1.7](https://github.com/substack/node-resolve/compare/1.1.6...1.1.7) - fix `node_modules` paths on Windows
- rimraf: v2.5.0 → [v2.5.2](https://github.com/isaacs/rimraf/compare/v2.5.0...v2.5.2)
- webpack: v1.12.11 → [v1.12.14](https://github.com/webpack/webpack/compare/v1.12.11...v1.12.14) - fix Windows filename backslash incompatibility
- webpack-dev-middleware: v1.4.0 → [v1.5.1](https://github.com/webpack/webpack-dev-middleware/compare/v1.4.0...v1.5.1) - platform-agnostic path joining, use `res.send` when available
- webpack-hot-middleware: v2.6.0 → [v2.7.1](https://github.com/glenjamin/webpack-hot-middleware/compare/v2.6.0...v2.7.1) - improve hint when hot reloads aren't accepted, update `strip-ansi` dependency (major), update stats handling

# 0.7.2 / 2016-01-15

**Fixed:**

- `react-app` and `web-app` Webpack build config didn't have `output.publicPath` set, so images required from JavaScript weren't being found [[#55](https://github.com/insin/nwb/issues/55)]
- Test runs no longer hang for up to a minute after completion [[#49](https://github.com/insin/nwb/issues/49)]

**Dependencies:**

- inquirer: v0.11.1 → [v0.11.2](https://github.com/SBoudrias/Inquirer.js/releases/tag/v0.11.2) - display fixes
- karma: v0.13.19 → v0.13.18 - downgraded due to the test hanging issue being introduced
- karma-sourcemap-loader: v0.3.6 → v0.3.7 - avoid EMFILE errors; fix charset bug; fix RangeError exception
- socket.io: v1.3.7 - temporarily pinned in nwb's dependencies until the Karma test hang issue is resolved
- webpack: v1.12.10 → [v1.12.11](https://github.com/webpack/webpack/compare/v1.12.10...v1.12.11)
- webpack-merge: v0.7.2 → v0.7.3 - bugfix

# 0.7.1 / 2016-01-10

**Fixed:**

- Express middleware had a broken import.

**Added:**

- Added an `autoInstall` option to Express middleware.

**Dependencies:**

- glob: v6.0.3 → v6.0.4 - remove `util._extend` to avoid deprecation warnings
- karma: v0.13.18 → [v0.13.19](https://github.com/karma-runner/karma/releases/tag/v0.13.19) - handle new socket.io internal format
- webpack: v1.12.9 → [v1.12.10](https://github.com/webpack/webpack/compare/v1.12.9...v1.12.10)
- webpack-merge: v0.7.1 → v0.7.2 - fix inclusion of removed `changelog` dependency

# 0.7.0 / 2016-01-05

**Fixed:**

- Fall back to nwb's dependencies in Webpack config instead of using an alias so `babel-runtime` can be picked up when `optional: ['runtime']` is used [hopefully fixing the weird `/node_modules/node_modules/` issue seen in [[#37](https://github.com/insin/nwb/issues/37)]

**Added:**

- Added an `--auto-install` flag to `nwb serve` which automatically installs npm dependencies and saves them to your package.json while developing.

**Removed:**

- `jsNext` config no longer defaults to `true` if not present.

**Changed:**

- Use `.x` for dependencies when generating skeleton project `package.json` instead of range sigils.

**Dependencies:**

- babel-runtime: v5.8.34 → v5.8.29 - downgraded due to a regression in typeof-react-element.js when used in conjunction with `optional: ['runtime']`
- karma: v0.13.16 → [v0.13.18](https://github.com/karma-runner/karma/releases/tag/v0.13.18)
- karma-phantomjs-launcher: v0.2.2 → v0.2.3 - correct cli argument order
- webpack-merge: v0.7.0 → v0.7.1 - performance improvements

# 0.6.4 / 2016-01-02

**Fixed:**

- `nwb build-umd` no longer errors if there is no `externals` config.

**Changed:**

- `nwb clean` now deletes the `coverage/` directory.

**Dependencies:**

- inquirer: v0.11.0 → [v0.11.1](https://github.com/SBoudrias/Inquirer.js/releases/tag/v0.11.1) - fix list overflow bug

# 0.6.3 / 2015-12-31

**Fixed:**

- Exit the process correctly with a non-zero exit code when an async command fails, such as `nwb test` [[#36](https://github.com/insin/nwb/pull/36)] [[jihchi][jihchi]]

**Dependencies:**

- karma-mocha-reporter: v1.1.4 → v1.1.5 - show error message when karma runner ends with error
- webpack-merge: v0.5.1 → v0.7.0 - bug fix for merging arrays within nested structures

# 0.6.2 / 2015-12-30

**Dependencies:**

- argv-set-env: v1.0.0 → [v1.0.1](https://github.com/kentcdodds/argv-set-env/releases/tag/v1.0.1) - docs
- glob: v6.0.1 → v6.0.3 - v6.0.2 was reverted
- karma: v0.13.15 → [v0.13.16](https://github.com/karma-runner/karma/releases/tag/v0.13.16)
- karma-mocha-reporter: v1.1.3 → v1.1.4 - handle duplicate descriptions
- karma-phantomjs-launcher: v0.2.1 → v0.2.2
- react-transform-catch-errors: v1.0.0 → [v1.0.1](https://github.com/gaearon/react-transform-catch-errors/releases/tag/v1.0.1) - display the offending call stack more prominently
- rimraf: v2.4.5 → v2.5.0 - add glob option
- webpack-merge: v0.3.2 → v0.5.1 - fix recursive merging

# 0.6.1 / 2015-12-30

**Fixed:**

- The `es6/` directory wasn't included in the default `.gitignore` for npm module project skeletons.

# 0.6.0 / 2015-12-23

**Added:**

- Added an `nwb init` command - same as `nwb new` but creates a project in the current directory and uses the directory name by default [[#25](https://github.com/insin/nwb/issues/25)]
- Added a new `web-app` project type - this is for anyone who wants to use nwb's build/serve/test setup but isn't using React [[#24](https://github.com/insin/nwb/issues/24)]
- Added a `--reload` option to auto-reload the page when webpack hot module replacement gets stuck. This is primarily intended for use with the new `web-app` project type.
- Command-line arguments can now be used to configure settings for `nwb new`.

**Fixed:**

- Production optimisations weren't being applied to React app builds.
- Demo apps weren't generating sourcemaps when bundling.
- Use a non-zero exit code when displaying usage or otherwise exiting due to missing arguments [[#23](https://github.com/insin/nwb/issues/23)]

**Changed:**

- Reorganised and coloured `nwb help` output.
- Commands which create files now log details of what they've created [[#26](https://github.com/insin/nwb/issues/26)]
- The ES6 modules build for npm modules is now optional, controlled by a `jsNext` setting in `nwb.config.js`, defaulting to `true` [[#27](https://github.com/insin/nwb/issues/27)]
  - nwb 0.6 will default `jsNext` to `true` and log a warning when it's missing from a config file - this behaviour will be removed in nwb v0.7.

**Dependencies:**

- copy-template-dir: v1.1.0 → v1.2.0 - provide created file paths in callback
- css-loader: v0.23.0 → v0.23.1
- expect: v1.13.3 → v1.13.4 - comparing arrays of nested objects fix
- rimraf: v2.4.4 → v2.4.5

# 0.5.0 / 2015-12-15

**Added:**

- Top-level Webpack config can now be provided for loaders which support it, as a `config` object in their `nwb.config.js` `loaders` configuration. This is intended for loaders which can't use serialisable `query` config due to plugins, such as some CSS preprocessors [[#18](https://github.com/insin/nwb/issues/18)]

**Fixed:**

- `files` config from template `package.json` was being used when packing nwb for publishing. Renamed them to `_package.json` to avoid this [[#22](https://github.com/insin/nwb/issues/22)]

**Changed:**

- Downgraded qs dependency so nwb can be used with Node.js 0.12.x [[#19](https://github.com/insin/nwb/issues/19)]

**Dependencies:**

- copy-template-dir: v1.0.5 → v1.1.0 - rename all files beginning with `_`
- expect: v1.13.0 → v1.13.3 - `Map`, `Set` and circular comparison fixes
- qs: v6.0.0 → v5.2.0 - downgrade to lose Node.js >= 4.0.0 requirement

# 0.4.1 / 2015-12-13

**Fixed:**

- Bad npm package for 0.4.0 - npm was reading the new `files` config from `package.json` in templates for React component/web module skeletons and applying it when packing nwb itself for publishing [[#21](https://github.com/insin/nwb/issues/21)]

# 0.4.0 / 2015-12-11

**Added:**

- Added `--fallback` option to `nwb serve`, for serving the index page from any path when developing React apps which use the HTML5 History API [[#16](https://github.com/insin/nwb/issues/16)]
- Added `"engines": {"node": ">=4.0.0"}` to `package.json` - nwb accidentally depends on this because it uses [qs](https://github.com/hapijs/qs) v6 [[#19](https://github.com/insin/nwb/issues/19)]
- Added `files` config to React component/web module skeleton `package.json`.
  - The `files` config for the React component skeleton assumes that components published to npm with `require()` calls for CSS which ships with it will use a `css/` dir.
- Added a default ES6 build with untranspiled ES6 module usage [[#15](https://github.com/insin/nwb/issues/15)]
  - This is pointed to by `"jsnext:main"` in project skeleton `package.json` for use by tree-shaking ES6 bundlers.

**Fixed:**

- Added missing `main` config to React component/web module skeleton `package.json`, pointing at the ES5 build in `lib/`.
- Express middleware wasn't included in npm package.

**Changed:**

- 1.0.0 is now the default version for project skeletons.

# 0.3.1 / 2015-12-09

**Fixed:**

- Generic `nwb build` was broken for React components/web modules in 0.3.0.

# 0.3.0 / 2015-12-07

**Added:**

- Support for CSS preprocessor plugin packages [[#6](https://github.com/insin/nwb/issues/6)]
  - Loading of configuration objects exported by `'nwb-*'` dependencies found in `package.json`.
  - Creation of style loading pipelines for plugins which provide `cssPreprocessors` configuration.
    - [nwb-less](https://github.com/insin/nwb-less)
    - [nwb-sass](https://github.com/insin/nwb-sass)

**Fixed:**

- Babel config is now passed to Babel when transpiling modules [[#13](https://github.com/insin/nwb/issues/13)]

# 0.2.0 / 2015-12-05

**Added:**

- Express [middleware](https://github.com/insin/nwb/blob/master/docs/Middleware.md#middleware) for running a React app on your own development server using nwb's Webpack config generation [[#8](https://github.com/insin/nwb/issues/8)]

**Changed:**

- Webpack loader config objects are now merged with [webpack-merge](https://github.com/survivejs/webpack-merge); query objects will now be deep merged, with lists occurring at the same position in build and user config being concatenated instead of overwritten.

**Fixed:**

- babel-runtime can now be resolved from nwb's dependencies when using `optional: ['runtime']` Babel config [[#10](https://github.com/insin/nwb/issues/10)]
- Paths to resources required from CSS in React app builds [[#9](https://github.com/insin/nwb/issues/9)]

# 0.1.0 / 2015-12-02

First 0.x release.

[balazs4]: https://github.com/balazs4
[bwendt-mylo]: https://github.com/bwendt-mylo
[DethAriel]: https://github.com/DethAriel
[grahamlyus]: https://github.com/grahamlyus
[jihchi]: https://github.com/jihchi
[michaelsbradleyjr]: https://github.com/michaelsbradleyjr
[ngyikp]: https://github.com/ngyikp
[ntwcklng]: https://github.com/ntwcklng
[seanofw]: https://github.com/seanofw
[totaldis]: https://github.com/totaldis
[treshugart]: https://github.com/treshugart
