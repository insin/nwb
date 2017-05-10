## Configuration

nwb's default setup can get you developing, testing and building production-ready apps and npm-ready components out of the box without any configuration.

If you need to tweak the default setup to suit your project's needs, or you want to use some of the other features the Babel, Karma and Webpack ecosystems have to offer, you can provide a configuration file.

> You can also add new functionality by installing a [plugin module](/docs/Plugins.md#plugins).

### Configuration File

By default, nwb will look for an `nwb.config.js` file in the current working directory for configuration.

You can also specify a configuration file using the `--config` option:

```
nwb --config ./config/nwb.js
```

This file should export either a configuration object...

```js
module.exports = {
  // ...
}
```

...or a function which returns a configuration object when called:

```js
module.exports = function(args) {
  return {
    // ...
  }
}
```

If a function is exported, it will be passed an object with the following properties:

- `args`: a parsed version of arguments passed to the `nwb` command
- `command`: the name of the command currently being executed, e.g. `'build'` or `'test'`
- `webpack`: nwb's version of the `webpack` module, giving you access to the other plugins webpack provides.

#### Example Configuration Files

- [react-hn's `nwb.config.js`](https://github.com/insin/react-hn/blob/concat/nwb.config.js) is a simple configuration file with minor tweaks to Babel and Webpack config.
- [React Yelp Clone's `nwb.config.js`](https://github.com/insin/react-yelp-clone/blob/nwb/nwb.config.js) configures Babel, Karma and Webpack to allow nwb to be dropped into an existing app to handle its development tooling, [reducing the amount of `devDependencies` and configuration](https://github.com/insin/react-yelp-clone/compare/master...nwb) which need to be managed.

### Configuration Object

The configuration object can include the following properties:

- nwb Configuration
  - [`type`](#type-string-required-for-generic-build-commands)
  - [`polyfill`](#polyfill-boolean) - control automatic polyfilling
- [Babel Configuration](#babel-configuration)
  - [`babel`](#babel-object)
  - [`babel.cherryPick`](#cherrypick-string--arraystring) - enable cherry-picking for destructured `import` statements
  - [`babel.loose`](#loose-boolean) - enable loose mode for Babel plugins which support it
  - [`babel.plugins`](#plugins-arraystring--array) - extra Babel plugins to be used
  - [`babel.presets`](#presets-arraystring) - extra Babel presets to be used
  - [`babel.runtime`](#runtime-string--boolean) - enable the `transform-runtime` plugin with different configurations
  - [`babel.stage`](#stage-number--false) - control which experimental and upcoming JavaScript features can be used
- [Webpack Configuration](#webpack-configuration)
  - [`webpack`](#webpack-object)
  - [`webpack.aliases`](#aliases-object) - rewrite certain import paths
  - [`webpack.autoprefixer`](#autoprefixer-string--object) - options for Autoprefixer
  - [`webpack.compat`](#compat-object) - enable Webpack compatibility tweaks for commonly-used modules
  - [`webpack.define`](#define-object) - options for `DefinePlugin`, for replacing certain expressions with values
  - [`webpack.extractText`](#extracttext-object) - options for `ExtractTextPlugin`
  - [`webpack.html`](#html-object) - options for `HtmlPlugin`
  - [`webpack.install`](#install-object) - options for `NpmInstallPlugin`
  - [`webpack.rules`](#rules-object) - tweak the configuration of the default Webpack rules
    - [Default Rules](#default-rules)
    - [Configuring PostCSS](#configuring-postcss)
    - [Configuring CSS Preprocessor Plugins](#configuring-css-preprocessor-plugins)
  - [`webpack.publicPath`](#publicpath-string) - path to static resources
  - [`webpack.uglify`](#uglify-object--false) - configure use of Webpack's `UglifyJsPlugin`
  - [`webpack.extra`](#extra-object) - an escape hatch for extra Webpack config, which will be merged into the generated config
- [Karma Configuration](#karma-configuration)
  - [`karma`](#karma-object)
  - [`karma.browsers`](#browsers-arraystring--plugin) - browsers tests are run in
  - [`karma.excludeFromCoverage`](#excludefromcoverage-string--arraystring) - globs for paths which should be excluded from code coverage reporting
  - [`karma.frameworks`](#frameworks-arraystring--plugin) - testing framework
  - [`karma.plugins`](#plugins-arrayplugin) - additional Karma plugins
  - [`karma.reporters`](#reporters-arraystring--plugin) - test results reporter
  - [`karma.testContext`](#testcontext-string) - point to a Webpack context module for your tests
  - [`karma.testFiles`](#testfiles-string--arraystring) - patterns for test files
  - [`karma.extra`](#extra-object-1) - an escape hatch for extra Karma config, which will be merged into the generated config
- [npm Build Configuration](#npm-build-configuration)
  - [`npm`](#npm-object)
  - [`npm.cjs`](#esmodules-boolean)
  - [`npm.esModules`](#esmodules-boolean)
  - UMD build
    - [`npm.umd`](#umd-string--object) - enable a UMD build which exports a global variable
      - [`umd.global`](#global-string) - global variable name exported by UMD build
      - [`umd.externals`](#externals-object) - dependencies to use via global variables in UMD build
    - [`package.json` fields](#packagejson-umd-banner-configuration)

#### `type`: `String` (required for generic build commands)

nwb uses this field to determine which type of project it's working with when generic build commands like `build` are used. If you're using commands which have the name of the type of project you're working with in them, you don't need to configure this.

If configured, it must be one of the following:

- `'inferno-app'`
- `'preact-app'`
- `'react-app'`
- `'react-component'`
- `'web-app'`
- `'web-module'`

#### `polyfill`: `Boolean`

For apps, nwb will provide polyfills for `Promise`, `fetch` and `Object.assign` by default.

To disable this, set `polyfill` to `false`:

```js
module.exports = {
  polyfill: false
}
```

### Babel Configuration

#### `babel`: `Object`

[Babel](https://babeljs.io/) configuration can be provided in a `babel` object, using the following properties.

> For Webpack builds, any Babel config provided will be used to configure `babel-loader` - you can also provide additional configuration in [`webpack.rules`](#rules-object) if necessary.

##### `cherryPick`: `String | Array<String>`

**Note:** this feature only works if you're using ES6 `import` syntax.

Module names to apply `import` cherry-picking to.

If you import a module with destructuring, the entire module will normally be included in your build, even though you're only using specific pieces:

```js
import {This, That, TheOther} from 'some-module'
```

The usual workaround for this is to individually import submodules, which is tedious and bloats import sections in your code:

```js
import This from 'some-module/lib/This'
import That from 'some-module/lib/That'
import TheOther from 'some-module/lib/TheOther'
```

If you use `cherryPick` config, you can keep writing code like the first example, but transpile to the same code as the second, by specifying the module name(s) to apply a cherry-picking transform to:

```js
module.exports = {
  babel: {
    cherryPick: 'some-module'
  }
}
```

This is implemented using [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash) - please check its issues for compatibility problems with modules you're using `cherryPick` with and report any new ones you find.

##### `loose`: `Boolean`

Some Babel plugins have a [loose mode](http://www.2ality.com/2015/12/babel6-loose-mode.html) in which they output simpler, potentially faster code rather than following the semantics of the ES6 spec closely.

**Loose mode is enabled by default with nwb**.

If you want to disable loose mode (e.g. to check your code works in the stricter normal mode for forward-compatibility purposes), set it to `false`.

e.g. to disable loose mode only when running tests:

```js
module.exports = {
  babel {
    loose: process.env.NODE_ENV === 'test'
  }
}
```

##### `plugins`: `Array<String | Array>`

Additional Babel plugins to use.

nwb commands are run in the current working directory, so if you need to configure additional Babel plugins or presets, you can install them locally, pass their names and let Babel import them for you.

e.g. to install and use the [babel-plugin-react-html-attrs](https://github.com/insin/babel-plugin-react-html-attrs#readme) plugin:

```
npm install babel-plugin-react-html-attrs
```
```js
module.exports = {
  babel: {
    plugins: ['react-html-attrs']
  }
}
```

##### `presets`: `Array<String>`

Additional Babel presets to use.

##### `runtime`: `String | Boolean`

Babel's [runtime transform](https://babeljs.io/docs/plugins/transform-runtime/) does 3 things by default:

1. Imports helper modules from `babel-runtime` instead of duplicating **helpers** in every module which needs them.
2. Imports a local **polyfill** for new ES6 built-ins (`Promise`) and static methods (e.g. `Object.assign`) when they're used in your code.
3. Imports the **regenerator** runtime required to use `async`/`await` when needed.

nwb's default config turns the regenerator runtime import on so you can use `async`/`await` and generators.

To enable an additional feature, you can name it (either `'helpers'` or `'polyfill'`):

```js
module.exports = {
  babel: {
    runtime: 'helpers'
  }
}
```

To enable all features, set `runtime` to `true`.

To disable use of the runtime transform, set `runtime` to `false`.

> Note: if you use `async`/`await` or enable the runtime transform's other features in a React Component or Web Module project, you will need to add `babel-runtime` to your package.json `peerDependencies` to ensure it can be resolved when somebody else uses your module from npm.

##### `stage`: `Number | false`

> nwb implements its own equivalent of Babel 5's `stage` config for Babel 6

Controls which Babel preset will be used to enable use of experimental, proposed and upcoming JavaScript features in your code, grouped by the stage they're at in the TC39 process for proposing new JavaScript features:

| Stage | TC39 Category | Features |
| ----- | ------------- | -------- |
| [0](https://babeljs.io/docs/plugins/preset-stage-0) | Strawman, just an idea |`do {...}` expressions, `::` function bind operator |
| [1](https://babeljs.io/docs/plugins/preset-stage-1) | Proposal: this is worth working on | export extensions |
| [2](https://babeljs.io/docs/plugins/preset-stage-2) | Draft: initial spec | class properties, `@decorator` syntax ( using the [Babel Legacy Decorator plugin](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy)) - **enabled by default** |
| [3](https://babeljs.io/docs/plugins/preset-stage-3) | Candidate: complete spec and initial browser implementations | object rest/spread `...` syntax,  `async`/`await`, `**` exponentiation operator, trailing function commas |

e.g. if you want to use export extensions in your app, you should set `stage` to `1`:

```js
module.exports = {
  babel {
    stage: 1
  }
}
```

Stage 2 is enabled by default - to disable use of a stage preset entirely, set `stage` to `false`:

```js
module.exports = {
  babel {
    stage: false
  }
}
```

### Webpack Configuration

#### `webpack`: `Object`

[Webpack](https://webpack.js.org/) configuration can be provided in a `webpack` object, using the following properties:

##### `aliases`: `Object`

Configures [Webpack aliases](https://webpack.js.org/configuration/resolve/#resolve-alias), which allow you to control module resolution. Typically aliases are used to make it easier to import certain modules from within nested directories in an app.

```js
module.exports = {
  webpack: {
    aliases: {
      // Enable use of 'img/file.png' paths in JavaScript and
      // "~images/file.png" paths in stylesheets to require an image from
      // src/images from anywhere in the the app.
      'img': path.resolve('src/images'),
      // Enable use of require('src/path/to/module.js') for top-down imports
      // from anywhere in the app, to promote writing location-independent
      // code by avoiding ../ directory traversal.
      'src': path.resolve('src')
    }
  }
}
```

You should be careful to avoid creating aliases which conflict with the names of Node.js built-ins or npm packages, as you will then be unable to import them.

##### `autoprefixer`: `String | Object`

Configures [Autoprefixer options](https://github.com/postcss/autoprefixer#options) for nwb's default PostCSS configuration.

If you just need to configure the range of browsers prefix addition/removal is based on (nwb's default is `>1%, last 4 versions, Firefox ESR, not ie < 9`), you can use a String:

```js
module.exports = {
  webpack: {
    autoprefixer: '> 1%, last 2 versions, Firefox ESR, ios >= 8'
  }
}
```

Use an Object if you need to set any of Autoprefixer's other options.

e.g. if you also want to disable removal of prefixes which aren't required for the configured range of browsers:

```js
module.exports = {
  webpack: {
    autoprefixer: {
      remove: false,
    }
  }
}
```

You can check which browsers your Autoprefixer configuration will target using the [browserl.ist](http://browserl.ist) service.

##### `compat`: `Object`

Certain libraries require specific configuration to play nicely with Webpack - nwb can take care of the details for you if you use a `compat` object to tell it when you're using them.

The following libraries are supported:

###### `enzyme`: `Boolean`

Set to `true` for [Enzyme](http://airbnb.io/enzyme/) compatibility - this assumes you're using the latest version of React (v15).

###### `moment`: `Object`

If you use [Moment.js](http://momentjs.com/) in a Webpack build, all the locales it supports will be imported by default and your build will be about 139KB larger than you were expecting!

Provide an object with a `locales` Array specifying language codes for the locales you want to load.

###### `sinon`: `Boolean`

Set to `true` for [Sinon.js](http://sinonjs.org/) 1.x compatibility.

---

Here's an example config showing the use of every `compat` setting:

```js
module.exports = {
  webpack: {
    compat: {
      enzyme: true,
      moment: {
        locales: ['de', 'en-gb', 'es', 'fr', 'it']
      },
      sinon: true
    }
  }
}
```

##### `define`: `Object`

By default, nwb will use Webpack's [`DefinePlugin`](https://webpack.js.org/plugins/define-plugin/) to replace all occurrences of `process.env.NODE_ENV` with a string containing `NODE_ENV`'s current value.

You can configure a `define` object to add your own constant values.

e.g. to replace all occurrences of `__VERSION__` with a string containing your app's version from its `package.json`:

```js
module.exports = {
  webpack: {
    define: {
      __VERSION__: JSON.stringify(require('./package.json').version)
    }
  }
}
```

##### `extractText`: `Object`

Configures [options for `ExtractTextWebpackPlugin`](https://github.com/webpack/extract-text-webpack-plugin#readme).

This can be used to control whether or not CSS is extracted from all chunks in an app which uses code splitting, or only the initial chunk:

```js
module.exports = {
  webpack: {
    extractText: {
      allChunks: true
    }
  }
}
```

##### `html`: `Object`

Configures [options for `HtmlWebpackPlugin`](https://github.com/ampedandwired/html-webpack-plugin#readme).

For apps, nwb will look for a `src/index.html` template to inject `<link>` and `<script>` tags into for CSS and JavaScript bundles generated by Webpack.

Use `template`config if you have an HTML file elsewhere you want to use:

```js
module.exports = {
  webpack: {
    html: {
      template: 'html/index.html'
    }
  }
}
```

If you don't have a template at `src/index.html` or specify one via `template`, nwb will fall back to using a basic template which has the following properties you can configure:

- `title` - contents for `<title>`

  > Default: the value of `name` from your app's `package.json`

- `mountId` - the `id` for the `<div>` provided for your app to mount itself into

  > Default: `'app'`

```js
module.exports = {
  webpack: {
    html: {
      mountId: 'root',
      title: 'Unimaginative documentation example'
    }
  }
}
```

Other `HtmlWebpackPlugin` options can also be used. e.g. if you have a `favicon.ico` in your `src/` directory, you can include it in the `index.html` generated when your app is built and have it copied to the output directory like so:

```js
module.exports = {
  webpack: {
    html: {
      favicon: 'src/favicon.ico'
    }
  }
}
```

##### `install`: `Object`

Configures [options for `NpmInstallPlugin`](https://github.com/ericclemmons/npm-install-webpack-plugin#usage), which will be used if you pass an `--install` flag to nwb commands which run a development server.

##### `rules`: `Object`

Each [Webpack rule](https://webpack.js.org/configuration/module/#module-rules) used in nwb's Webpack configuration has an associated id you can use to customise it.

To customise a rule, add a prop to the `rules` object matching its id with a configuration object.

Refer to the documentation of the Webpack loader used in each rule (linked to for each [default rule](#default-rules) documented below) for configuration options which can be set.

Generic rule options such as `include` and `exclude` can be configured alongside loader-specific options - you can also use an explicit `options` object if necessary to separate this configuration.

e.g. to enable [CSS Modules][CSS Modules] for your app's CSS, the following rule configs are equivalent:

```js
module.exports = {
  webpack: {
    rules: {
      css: {
        options: {
          modules: true,
          localIdentName: '[hash:base64:5]'
        }
      }
    }
  }
}
```
```js
module.exports = {
  webpack: {
    rules: {
      css: {
        modules: true,
        localIdentName: '[hash:base64:5]'
      }
    }
  }
}
```

###### Default Rules

Default rules configured by nwb and the ids it gives them are:

- `babel` - handles `.js` files with [babel-loader][babel-loader]

  > Default config: `{exclude: /node_modules/, options: {babelrc: false, cacheDirectory: true}}`

- `css-pipeline` - handles your app's own `.css` files by chaining together a number of loaders:

  > Default config: `{exclude: /node_modules/}`

  Chained loaders are:

  - `style` - (only when serving) applies styles using [style-loader][style-loader]

  - `css` - handles URLs, minification and CSS Modules using [css-loader][css-loader]

    > Default config: `{options: {importLoaders: 1}}`

  - `postcss` - processes CSS with PostCSS plugins using [postcss-loader][postcss-loader]; by default, this is configured to manage vendor prefixes in CSS using [Autoprefixer][autoprefixer]

    > Default config: `{options: {plugins: [Autoprefixer]}}`

- `vendor-css-pipeline` - handles `.css` files imported from `node_modules/`, with the same set of chained loaders as `css-pipeline` but with a `vendor-` prefix in their id.

  > Default config: `{include: /node_modules/}`

- `graphics` - handles `.gif`, `.png` and `.webp` files using using [url-loader][url-loader]

- `svg` - handles `.svg` files using using [url-loader][url-loader]

- `jpeg` - handles `.jpg` and `.jpeg` files using [url-loader][url-loader]

- `fonts` - handles `.eot`, `.otf`, `.ttf`, `.woff` and `.woff2` files using [url-loader][url-loader]

- `video` - handles `.mp4`, `.ogg` and `.webm` files using [url-loader][url-loader]

- `audio` - handles `.wav`, `.mp3`, `.m4a`, `.aac`, and `.oga` files using [url-loader][url-loader]

> Default config for all url-loaders in production builds is `{options: {limit: 1, name: '[name].[hash:8].[ext]'}}`, otherwise `{options: {limit: 1, name: '[name].[ext]'}}`.

> Default `limit` config prevents any files being inlined by default, while allowing you to configure `url-loader` to enable inlining if you need it.

###### Configuring PostCSS

By default, nwb uses [PostCSS](http://postcss.org/) to manage vendor prefixes in CSS using [Autoprefixer][autoprefixer].

If you want to make more significant use of PostCSS, you can use `webpack.rules` to provide your own list of plugins.

e.g. to provide your own list of plugins for your app's own CSS, configure `webpack.rules.postcss`:

```js
module.exports = {
  webpack: {
    rules: {
      postcss: {
        plugins: [
          require('precss')()
          require('autoprefixer')()
        ]
      }
    }
  }
}
```

###### Configuring CSS Preprocessor Plugins

Rule ids for configuring nwb [CSS preprocessor plugins](/docs/Plugins.md#css-preprocessor-plugins) follow a similar pattern to `css-pipeline` and `vendor-css-pipeline` above, except they make use of an id associated with each preprocessor.

Using [nwb-sass](https://github.com/insin/nwb-sass) as example, you can use the following ids in `webpack.rules` config to configure each part of the pipeline for your app's Sass stylesheets:

- `sass-pipeline`
  - `sass-style` (only when serving)
  - `sass-css`
  - `sass-postcss`
  - `sass` (use to configure [sass-loader][sass-loader])

There will also be a `vendor-sass-pipeline` for Sass stylesheets with the same setup as `sass-pipeline` but using a `vendor-` prefix.

##### `publicPath`: `String`

> This is just Webpack's [`output.publicPath` config](https://webpack.js.org/configuration/output/#output-publicpath) pulled up a level to make it more convenient to configure.

`publicPath` defines the URL static resources will be referenced by in build output, such as `<link>` and `<src>` tags in generated HTML, `url()` in stylesheets and paths to any static resources you `require()` into your modules.

The default `publicPath` configured for most app builds is `/`, which assumes you will be serving your app's static resources from the root of whatever URL it's hosted at:

```html
<script src="/app.12345678.js"></script>
```

If you're serving static resources from a different path, or from an external URL such as a CDN, set it as the `publicPath`:

```js
module.exports = {
  webpack: {
    publicPath: 'https://cdn.example.com/myapp/'
  }
}
```

The exception is the React component demo app, which doesn't set a `publicPath`, generating a build without any root URL paths to static resources. This allows you to serve it at any path without configuration (e.g. on GitHub Project Pages), or open the generated `index.html` file directly in a browser, which is ideal for distributing app builds which don't require a server to run.

If you want to create a path-independent build, set `publicPath` to blank or `null`:

```js
module.exports = {
  webpack: {
    publicPath: ''
  }
}
```

The trade-off for path-independence is HTML5 History routing won't work, as serving up `index.html` at anything but its real path will mean its static resource URLs won't resolve. You will have to fall back on hash-based routing if you need it.

##### `uglify`: `Object | false`

Configures [options for Webpack's `UglifyJsPlugin`](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin), which will be used when creating production builds.

Any additional options provided will be merged into nwb's defaults, which are:

```js
{
  compress: {
    warnings: false
  },
  output: {
    comments: false
  },
  sourceMap: true
}
```

For example, if you want to strip development-only code but keep the output readable for debugging:

```js
module.exports = {
  webpack: {
    uglify: {
      mangle: false,
      beautify: true
    }
  }
}
```

To completely disable use of UglifyJS, set `uglify` to false:

```js
module.exports = {
  webpack: {
    uglify: false
  }
}
```

##### `extra`: `Object`

Extra configuration to be merged into the generated Webpack configuration using [webpack-merge](https://github.com/survivejs/webpack-merge#webpack-merge---merge-designed-for-webpack) - see the [Webpack configuration docs](https://webpack.js.org/configuration/) for the available properties.

Note that you *must* use Webpack's own config structure in this object - e.g. to add an extra rule which isn't managed by nwb's own `webpack.rules` config, you would need to provide a list of rules at `webpack.extra.module.rules`.

```js
var path = require('path')

function(nwb) {
  return {
    type: 'react-app',
    webpack: {
      extra: {
        // Example of adding an extra rule which isn't managed by nwb,
        // assuming you have installed html-loader in your project.
        module: {
          rules: [
            {test: /\.html$/, loader: 'html-loader'}
          ]
        },
        // Example of adding an extra plugin which isn't managed by nwb
        plugins: [
          new nwb.webpack.optimize.MinChunkSizePlugin({
            minChunkSize: 1024
          })
        ]
      }
    }
  }
}
```

### Karma Configuration

nwb's default [Karma](http://karma-runner.github.io/) configuration uses the [Mocha](https://mochajs.org/) framework and reporter plugins for it, but you can configure your own preferences.

**Note:** At runtime, Karma sets a `usePolling` autoWatch option to `true` [if the platform is detected to be macOS or Linux](https://github.com/karma-runner/karma/blob/master/lib/config.js#L318). However, Karma's non-polling file-watching works correctly and consumes dramatically less CPU on macOS. nwb users on macOS will want to set `usePolling: false` within the [`extra:`](#extra-object-1) Object in the `karma:` config section of their `nwb.config.js`.

#### `karma`: `Object`

Karma configuration can be provided in a `karma` object, using the following properties:

##### `browsers`: `Array<String | Plugin>`

> Default: `['PhantomJS']`

A list of browsers to run tests in.

PhantomJS is the default as it's installed by default with nwb and should be able to run in any environment.

The launcher plugin for Chrome is also included, so if you want to run tests in Chrome, you can just name it:

```js
module.exports = {
  karma: {
    browsers: ['Chrome']
  }
}
```

For other browsers, you will also need to supply a plugin and manage that dependency yourself:

```js
module.exports = {
  karma: {
    browsers: ['Firefox'],
    plugins: [
      require('karma-firefox-launcher')
    ]
  }
}
```

nwb can also use the first browser defined in a launcher plugin if you pass it in `browsers`:

```js
module.exports = {
  karma: {
    browsers: [
      'Chrome',
      require('karma-firefox-launcher')
    ]
  }
}
```

##### `excludeFromCoverage`: `String | Array<String>`

> Default: `['test/', 'tests/', 'src/**/__tests__/']`

Globs for paths which should be excluded from code coverage reporting.

##### `frameworks`: `Array<String | Plugin>`

> Default: `['mocha']`

Karma testing framework plugins.

You must provide the plugin for any custom framework you want to use and manage it as a dependency yourself.

e.g. if you're using a testing framework which produces [TAP](https://testanything.org/) output (such as [tape](https://github.com/substack/tape)). this is how you would use `frameworks` and `plugins` props to configure Karma:

```
npm install --save-dev karma-tap
```
```js
module.exports = {
  karma: {
    frameworks: ['tap'],
    plugins: [
      require('karma-tap')
    ]
  }
}
```

nwb can also determine the correct framework name given the plugin itself, so the following is functionally identical to the configuration above:

```js
module.exports = {
  karma: {
    frameworks: [
      require('karma-tap')
    ]
  }
}
```

If a plugin module provides multiple plugins, nwb will only infer the name of the first plugin it provides, so pass it using `plugins` instead and list all the frameworks you want to use, for clarity:

```js
module.exports = {
  karma: {
    frameworks: ['mocha', 'chai', 'chai-as-promised'],
    plugins: [
      require('karma-chai-plugins') // Provides chai, chai-as-promised, ...
    ]
  }
}
```

**Note:** If you're configuring frameworks and you want to use the Mocha framework plugin managed by nwb, just pass its name as in the above example.

##### `testContext`: `String`

Use this configuration to point to a [Webpack context module](/docs/Testing.md#using-a-test-context-module) for your tests if you need to run code prior to any tests being run, such as customising the assertion library you're using, or global before and after hooks.

If you provide a context module, it is responsible for including tests via Webpack's  `require.context()` - see the [example in the Testing docs](/docs/Testing.md#using-a-test-context-module).

If the default [`testFiles`](#testfiles-string--arraystring) config wouldn't have picked up your tests, you must also configure it so they can be excluded from code coverage.

##### `testFiles`: `String | Array<String>`

> Default: `.spec.js`, `.test.js` or `-test.js` files anywhere under `src/`, `test/` or `tests/`

[Minimatch glob patterns](https://github.com/isaacs/minimatch) for test files.

If [`karma.testContext`](#testcontext-string) is not being used, this controls which files Karma will run tests from.

This can also be used to exclude tests from code coverage if you're using [`karma.testContext`](#testcontext-string) - if the default `testFiles` patterns wouldn't have picked up your tests, configure this as well to exclude then from code coverage.

##### `plugins`: `Array<Plugin>`

A list of plugins to be loaded by Karma - this should be used in combination with [`browsers`](#browsers-arraystring--plugin), [`frameworks`](#frameworks-arraystring--plugin) and [`reporters`](#reporters-arraystring--plugin) config as necessary.

##### `reporters`: `Array<String | Plugin>`

> Default: `['mocha']`

Customising reporters follows the same principle as frameworks, just using the `reporters` prop instead.

For built-in reporters, or nwb's version of the Mocha reporter, just pass a name:

```js
module.exports = {
  karma: {
    reporters: ['progress']
  }
}
```

For custom reporters, install and provide the plugin:

```
npm install --save-dev karma-tape-reporter
```
```js
module.exports = {
  karma: {
    reporters: [
      require('karma-tape-reporter')
    ]
  }
}
```

##### `extra`: `Object`

Extra configuration to be merged into the generated Karma configuration using [webpack-merge](https://github.com/survivejs/webpack-merge#webpack-merge---merge-designed-for-webpack).

Note that you *must* use Karma's own config structure in this object.

e.g. to tweak the configuration of the default Mocha reporter:

```js
module.exports = {
  karma: {
    extra: {
      mochaReporter: {
        divider: '°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸',
        output: 'autowatch'
      }
    }
  }
}
```

### npm Build Configuration

By default, nwb creates ES5 and ES6 modules builds for publishing to npm.

#### `npm`: `Object`

npm build configuration is defined in a `npm` object, using the following fields:

##### `cjs`: `Boolean`

> Defaults to `true` if not provided.

Determines whether or not nwb will create a CommonJS build in `lib/` when you run `nwb build` for a React component/library or web module project.

Set to `false` to disable this:

```js
module.exports = {
  npm: {
    cjs: false
  }
}
```

##### `esModules`: `Boolean`

> Defaults to `true` if not provided.

Determines whether or not nwb will create an ES6 modules build for use by ES6 module bundlers when you run `nwb build` for a React component/library or web module project.

When providing an ES6 modules build, you should also provide the following in `package.json` so compatible module bundlers can find it:

```
"module": "es/index.js",
```

These are included automatically if you create a project with an ES6 modules build enabled.

##### `umd`: `String | Object`

Configures creation of a UMD build when you run `nwb build` for a React component/library or web module.

If you just need to configure the global variable the UMD build will export, you can use a String:

```js
module.exports = {
  npm: {
    umd: 'MyLibrary'
  }
}
```

If you also have some external dependencies to configure, you must use an Object containing the following properties:

###### `global`: `String`

The name of the global variable the UMD build will export.

###### `externals`: `Object`

A mapping from `peerDependency` module names to the global variables they're expected to be available as for use by the UMD build.

e.g. if you're creating a React component which also depends on [React Router](https://github.com/reactjs/react-router), this configuration would ensure they're not included in the UMD build:

```js
module.exports = {
  npm: {
    umd: {
      global: 'MyComponent',
      externals: {
        'react': 'React',
        'react-router': 'ReactRouter'
      }
    }
  }
}
```

#### `package.json` UMD Banner Configuration

A banner comment added to UMD builds will use as many of the following `package.json` fields as are present:

- `name`
- `version`
- `homepage`
- `license`

If all fields are present the banner will be in this format:

```js
/*!
 * your-project v1.2.3 - https://github.com/you/your-project
 * MIT Licensed
 */
```

[autoprefixer]: https://github.com/postcss/autoprefixer/
[babel-loader]: https://github.com/babel/babel-loader/
[CSS Modules]: https://github.com/css-modules/css-modules/
[css-loader]: https://github.com/webpack/css-loader/
[isparta-loader]: https://github.com/deepsweet/isparta-loader/
[npm-install-loader]: https://github.com/ericclemmons/npm-install-loader/
[postcss-loader]: https://github.com/postcss/postcss-loader/
[sass-loader]: https://github.com/jtangelder/sass-loader
[style-loader]: https://github.com/webpack/style-loader/
[url-loader]: https://github.com/webpack/url-loader/
