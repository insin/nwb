**Fixed:**

- `react-app` and `web-app` Webpack build config didn't have `output.publicPath` set, so images required from JavaScript weren't being found [#55](https://github.com/insin/nwb/issues/55)]

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

- Fall back to nwb's dependencies in Webpack config instead of using an alias so `babel-runtime` can be picked up when `optional: ['runtime']` is used [hopefully fixing the weird `/node_modules/node_modules/` issue seen in [#37](https://github.com/insin/nwb/issues/37)]

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

- The `es6/` directory wasn't included in the default `.gitignore` for npm module project templates.

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
  - nwb 0.6 will default `jsNext` to `true` and log a warning when it's missing from a config file - this behaviour will be removed in nwb 0.7.

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

- Bad npm package for 0.4.0 - npm was reading the new `files` config from `package.json` in templates for React components/web modules and applying it when packing nwb itself for publishing [[#21](https://github.com/insin/nwb/issues/21)]

# 0.4.0 / 2015-12-11

**Added:**

- Added `--fallback` option to `nwb serve`, for serving the index page from any path when developing React apps which use the HTML5 History API [[#16](https://github.com/insin/nwb/issues/16)]
- Added `"engines": {"node": ">=4.0.0"}` to `package.json` - nwb accidentally depends on this because it uses [qs](https://github.com/hapijs/qs) v6 [[#19](https://github.com/insin/nwb/issues/19)]
- Added `files` config to React component/web module `package.json` templates.
  - The `files` config for the React component template assumes that components published to npm with `require()` calls for CSS which ships with it will use a `css/` dir.
- Added a default ES6 build with untranspiled ES6 module usage [[#15](https://github.com/insin/nwb/issues/15)]
  - This is pointed to by `jsnext:main` in project template `package.json` for use by tree-shaking ES6 bundlers.

**Fixed:**

- Added missing `main` config to React component/web module `package.json` templates, pointing at the ES5 build in `lib/`.
- Express middleware wasn't included in npm package.

**Changed:**

- 1.0.0 is now the default version for template projects.

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

[jihchi]: https://github.com/jihchi
