**Removed:**

- Removed support for deprecated `webpack.plugins` config.

**Changed:**

- [`webpack.uglify` config](https://github.com/insin/nwb/blob/next/docs/Configuration.md#uglify-object--false) can now be set to `false` to disable use of `UglifyJSPlugin` in production builds. [[#160](https://github.com/insin/nwb/issues/160)]

**Dependencies:**

- babel-loader: v6.2.4 → [v6.2.5](https://github.com/babel/babel-loader/blob/master/CHANGELOG.md) - better syntax error messages
- karma-chrome-launcher: v1.0.1 → [v2.0.0](https://github.com/karma-runner/karma-chrome-launcher/blob/master/CHANGELOG.md#200-2016-08-18) - chromium support
- postcss-loader: v0.10.0 → [v0.10.1](https://github.com/postcss/postcss-loader/blob/master/CHANGELOG.md#0101) - better syntax error messages
- webpack: v1.13.1 → [v1.13.2](https://github.com/webpack/webpack/compare/v1.13.1...v1.13.2) - updated node-libs-browser

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

- **Dropped Node.js v0.12 support**

  Based on the `engines` config of nwb's dependencies, Node.js v4.2.0 is now the minimum required version.
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

  They've been **replaced with `build-react-component` and `build-web-module` commands**, which are now used in `package.json` `scripts` in the corresponding project templates.

  As a result **having a config file is now optional for all project types**. If you don't need configuration, you can delete the `nwb.config.js` file created as a convenience by project templates.

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

> For deprecations, nwb v0.12 will support the old format, display warning messages about the changes required, and adapt the old format for use in the current build where possible.

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

- **Added a [`--preact` flag](https://github.com/insin/nwb/blob/0.12/docs/Commands.md#build-1)** to React app builds to create a [preact-compat](https://github.com/developit/preact-compat) build.

  This is an easy way to try [Preact](https://github.com/developit/preact) with your React apps, resulting in a much smaller bundle if your app is compatible [[#124](https://github.com/insin/nwb/issues/124)]

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

- The react-app template project now includes examples of importing CSS and images.
- Required `<meta>` tags in HTML templates are now all first thing in `<head>`.
- Added `shrink-to-fit=no` to the `viewport` `<meta>` tag in HTML templates for Safari.

**Dependencies:**

- autoprefixer: v6.3.6 → [v6.4.0](https://github.com/postcss/autoprefixer/blob/master/CHANGELOG.md#640)
- babel\* v5 → babel\* v6
- [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul/): v2.0.0
- [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash): v3.2.6
- [babel-plugin-transform-react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types): v0.2.9
- [case-sensitive-paths-webpack-plugin](https://github.com/Urthen/case-sensitive-paths-webpack-plugin): v1.1.3
- connect-history-api-fallback: v1.2.0 → [v1.3.0](https://github.com/bripkens/connect-history-api-fallback/blob/master/CHANGELOG.md#v130) - allow disabling of the dot rule
- copy-template-dir: v1.2.1 → v1.3.0 - support vars in filenames
- expect: v1.20.1 → [v1.20.2](https://github.com/mjackson/expect/compare/v1.20.1...v1.20.2)
- express: v4.13.4 → [v4.14.0](https://github.com/expressjs/express/blob/master/History.md#4140--2016-06-16)
- [figures](https://github.com/sindresorhus/figures): v1.7.0
- file-loader: v0.8.5 → [v0.9.0](https://github.com/webpack/file-loader/compare/v0.8.5...v0.9.0)
- glob: v7.0.3 → [v7.0.5](https://github.com/isaacs/node-glob/https://github.com/Medium/phantomjs/)
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

> For deprecations, nwb v0.11 will support the old format and display warning messages about the changes required.

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
- fs-extra: v0.26.7 → [v0.30.0](https://github.com/jprichardson/node-fs-extra/blob/master/CHANGELOG.md#0300--2016-04-28)
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
- fs-extra: v0.26.5 → 0.26.7 - bug fixes for `copy` and `emptyDir`
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

> nwb v0.8 will support the old format and display warning messages about the changes required before upgrading to nwb v0.9.

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
- Development instructions in project templates were moved from `README.md` to a `CONTRIBUTING.md` file, and are now documented using `npm` and `npm run` commands instead of global `nwb` commands.
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
- extract-text-webpack-plugin: v0.9.1 → [v1.0.1](https://github.com/webpack//extract-text-webpack-plugin/compare/v0.9.1...v1.0.1) - use webpack-sources
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

- Bad npm package for 0.4.0 - npm was reading the new `files` config from `package.json` in templates for React components/web modules and applying it when packing nwb itself for publishing [[#21](https://github.com/insin/nwb/issues/21)]

# 0.4.0 / 2015-12-11

**Added:**

- Added `--fallback` option to `nwb serve`, for serving the index page from any path when developing React apps which use the HTML5 History API [[#16](https://github.com/insin/nwb/issues/16)]
- Added `"engines": {"node": ">=4.0.0"}` to `package.json` - nwb accidentally depends on this because it uses [qs](https://github.com/hapijs/qs) v6 [[#19](https://github.com/insin/nwb/issues/19)]
- Added `files` config to React component/web module `package.json` templates.
  - The `files` config for the React component template assumes that components published to npm with `require()` calls for CSS which ships with it will use a `css/` dir.
- Added a default ES6 build with untranspiled ES6 module usage [[#15](https://github.com/insin/nwb/issues/15)]
  - This is pointed to by `"jsnext:main"` in project template `package.json` for use by tree-shaking ES6 bundlers.

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
