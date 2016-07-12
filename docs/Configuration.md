## Configuration

### What's Configurable?

- Babel 5 settings
- Webpack settings
  - Default sets of loaders and plugins are provided and made configurable
  - Additional CSS preprocessors can be added as [nwb plugins](/docs/Plugins.md#css-preprocessors)
  - Extra config can be deep-merged into the generated Webpack config
- Karma settings
  - Additional plugins, frameworks and reporters can be configured
  - Extra config can be deep-merged into the generated Webpack config
- Project layout
  - Entry point for apps and UMD builds *[default: `src/index.js`]*
  - Directory apps are built to *[default: `dist/`]*
  - HTML template for apps *[default: `src/index.html`]*, falling back to a default template if none is provided.

### Not Configurable... Yet

- Project layout
  - Source is assumed to be under `src/`
  - Static resources for apps are assumed to be in `public/`
  - The entry point for React component demo apps is assumed to be `demo/src/index.js`, with built resources in `demo/dist/`

### Configuration File

nwb will look for an `nwb.config.js` file in the current working directory for project-specific configuration, or you can specify a configuration file using the `--config` option.

This file should export either a configuration object or a function which creates a configuration object when called. If a function is exported, it will be passed an object containing the following properties:

- `command`: the name of the nwb command currently being executed.
- `webpack`: nwb's version of the `webpack` module.

The configuration object created by your nwb config can use the following fields:

- nwb Configuration
  - [`type`](#type-string-required-for-generic-build-commands)
- Babel Configuration
  - [`babel`](#babel-object)
- Webpack Configuration
  - [`webpack`](#webpack-object)
  - [`webpack.loaders`](#loaders-object)
    - [Default loaders](#default-loaders)
    - [Test loaders](#test-loaders)
  - [`webpack.define`](#define-object)
  - [`webpack.extractText`](#extracttext-object)
  - [`webpack.html`](#html-object)
  - [`webpack.install`](#install-object)
  - [`webpack.uglify`](#uglify-object)
  - [`webpack.vendorBundle`](#vendorbundle-boolean)
  - [`webpack.postcss`](#postcss-array--object)
  - [`webpack.compat`](#compat-object)
  - [`webpack.extra`](#extra-object)
- Karma Configuration
  - [`karma`](#karma-object)
  - [`karma.tests`](#tests-string)
  - [`karma.frameworks`](#frameworks-arraystring--plugin)
  - [`karma.reporters`](#reporters-arraystring--plugin)
  - [`karma.plugins`](#plugins-arrayplugin)
  - [`karma.extra`](#extra-object-1)
- npm Build Configuration
  - [`build`](#build-object)
  - UMD build config
    - [`build.umd`](#umd-boolean)
    - [`build.global`](#global-string-required-for-umd-build)
    - [`build.externals`](#externals-object-for-umd-build)
    - [`package.json` fields](#packagejson-umd-banner-configuration)
  - [`build.jsNext`](#jsnext-boolean)

#### `type`: `String` (required for generic build commands)

nwb uses this field to determine which type of project it's working with when generic build commands like `build` are used.

It must be one of:

- `'react-app'`
- `'react-component'`
- `'web-app'`
- `'web-module'`

### Babel Configuration

#### `babel`: `Object`

Use this object to provide your own options for Babel (version 5) - [see the Babel 5 options documentation](https://github.com/babel/babel.github.io/blob/862b43db93e48762671267034a50c30c00e433e2/docs/usage/options.md).

e.g. to use `async`/`await` transforms, you will need to configure Babel's `stage` and `optional` settings:

```js
module.exports = {
  babel: {
    stage: 0,
    optional: ['runtime']
  }
}
```

nwb commands are run in the current working directory, so if you need to configure additional Babel plugins, you can just use their names and let Babel import them.

e.g. to install and use the [babel-plugin-react-html-attrs](https://github.com/insin/babel-plugin-react-html-attrs#readme) plugin:

```
npm install babel-plugin-react-html-attrs@1.x
```
```js
module.exports = {
  babel: {
    plugins: ['react-html-attrs']
  }
}
```

If provided, Babel config will also be used to configure the `babel-loader` Webpack loader if there isn't any other configuration specified for it in [`webpack.loaders`](#loaders-object).

### Webpack Configuration

#### `webpack`: `Object`

Webpack configuration can be provided in a `webpack` object.

##### `loaders`: `Object`

Each [Webpack loader](https://webpack.github.io/docs/loaders.html) configured by default has a unique id you can use to customise it.

To customise a loader, add a prop to the `loaders` object matching its id with a configuration object.

Refer to each loader's documentation (linked to for each [default loader](#default-loaders) documented below) for configuration options which can be set.

Generic loader options such as `include` and `exclude` can be configured alongside loader-specific query options - you can also use an explicit `query` object if necessary to separate this configuration.

e.g. to enable [CSS Modules][CSS Modules] for your app's CSS, the following loader configs are equivalent:

```js
module.exports = {
  webpack: {
    loaders: {
      css: {
        modules: true,
        localIdentName: '[hash:base64:5]'
      }
    }
  }
}
```
```js
module.exports = {
  webpack: {
    loaders: {
      css: {
        query: {
          modules: true,
          localIdentName: '[hash:base64:5]'
        }
      }
    }
  }
}
```

If a loader supports configuration via a top-level webpack configuration property, this can be provided as a `config` prop. This is primarily for loaders which can't be configured via query parameters as they have configuration which can't be serialised, such as instances of plugins.

e.g. to use the `nib` plugin with the [Stylus](http://learnboost.github.io/stylus/) preprocessor provided by [nwb-stylus](https://github.com/insin/nwb-stylus):

```js
var nib = require('nib')

module.exports = {
  webpack: {
    loaders: {
      stylus: {
        config: {
          use: [nib()]
        }
      }
    }
  }
}
```

Alternatively, you can also add new properties directly to the top-level Webpack config using [`extra`](#extra-object)

###### Default Loaders

Default loaders configured by nwb and the ids it gives them are:

- `babel` - handles `.js` (and `.jsx`) files with [babel-loader][babel-loader]

  > Default config: `{exclude: /node_modules/}`

- `css-pipeline` - handles your app's own`.css` files by chaining together a number of loaders:

  > Default config: `{exclude: /node_modules/}`

  Chained loaders are:

  - `style` - (only when serving) applies styles using [style-loader][style-loader]
  - `css` - handles URLs, minification and CSS Modules using [css-loader][css-loader]
  - `postcss` - processes CSS with PostCSS plugins using [postcss-loader][postcss-loader]; by default, this is configured to automatically add vendor prefixes to CSS using [autoprefixer][autoprefixer]

- `vendor-css-pipeline` - handles `.css` files required from `node_modules/`, with the same set of chained loaders as `css-pipeline` but with a `vendor-` prefix in their id.

  > Default config: `{include: /node_modules/}`

- `graphics` - handles `.gif` and `.png` files using using [url-loader][url-loader]

  > Default config: `{limit: 10240}`

- `jpeg` - handles `.jpeg` files using [file-loader][file-loader]

- `fonts` - handles `.otf`, `.svg`, `.ttf`, `.woff` and `.woff2` files using [url-loader][url-loader]

  > Default config: `{limit: 10240}`

- `eot` - handles `.eot` files using [file-loader][file-loader]

- `json` - handles `.json` files using [json-loader][json-loader]

###### Test loaders

When running Karma tests with coverage enabled, the following loader will be added:

- `isparta` - handles instrumentation of source files for coverage analysis using [isparta-loader][isparta-loader]

  > Default config: `{include: path.join(cwd, 'src')}` (where cwd is the directory you ran `nwb test` from).

  You may need to tweak this loader if you're [changing where Karma looks for tests](#tests-string) - e.g. if you're colocating tests in `__tests__` directories, you will want to configure isparta-loader to ignore these:

  ```js
  module.exports = {
    webpack: {
      loaders: {
        isparta: {
          exclude: /__tests__/
        }
      }
    }
  }
  ```

##### `define`: `Object`

By default, nwb will use Webpack's [`DefinePlugin`](https://webpack.github.io/docs/list-of-plugins.html#defineplugin) to replace all occurances of `process.env.NODE_ENV` with a string containing `NODE_ENV`'s current value.

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

For apps, nwb will look for a `src/index.html` template to inject `<link>` and `<script>` tags into for each CSS and JavaScript bundle generated by Webpack.

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

Configures [options for `NpmInstallPlugin`](https://github.com/ericclemmons/npm-install-webpack-plugin#usage), which will be used if you pass `--auto-install` flag to `nwb serve`.

##### `uglify`: `Object`

Configures [options for Webpack's `UglifyJsPlugin`](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin), which will be used when creating production builds.

Any additional options provided will be merged into nwb's defaults, which are:

```js
{
  compress: {
    screw_ie8: true,
    warnings: false,
  },
  mangle: {
    screw_ie8: true,
  },
  output: {
    comments: false,
    screw_ie8: true,
  },
}
```

##### `vendorBundle`: `Boolean`

Setting this to `false` disables extraction of anything imported from `node_modules/` into a `vendor` bundle.

##### `postcss`: `Array | Object`

By default, nwb configures the `postcss-loader` in each style pipeline to automatically add vendor prefixes to CSS rules.

Use `postcss` configuration to provide your own list of PostCSS plugins to be used for each pipeline, which will completely overwrite nwb's default configuration.

If you're *only* configuring PostCSS plugins for your app's own CSS, you can just provide a list:

```js
module.exports = {
  webpack: {
    postcss: [
      require('precss')(),
      require('autoprefixer')(),
      require('cssnano')()
    ]
  }
}
```

Use an object if you're configuring other style pipelines. When using an object, PostCSS plugins for the default style pipeline (applied to your app's own CSS) must be configured using a `defaults` property:

```js
var autoprefixer = require('autoprefixer')
module.exports = {
  webpack: {
    postcss: {
      defaults: [
        require('precss')(),
        autoprefixer(),
        require('cssnano')()
      ],
      vendor: [
        autoprefixer({add: false})
      ]
    }
  }
}
```

Plugins for other style pipelines are configured using their prefix as a property name: `vendor` for anything imported out of `node_modules/`, `sass` if you're using the `nwb-sass` preprocessor plugin, etc.

Your app is responsible for managing its own PostCSS plugin dependencies - between the size of the PostCSS ecosystem and the number of different configuration options `postcss-loader` supports, PostCSS could do with its own equivalent of nwb to manage dependencies and configuration!

It's recommended to create instances of PostCSS plugins in your config, as opposed to passing a module, in case you ever need to make use of debug output (enabled by setting a `DEBUG` environment variable to `nwb`) to examine generated config.

##### `compat`: `Object`

Certain libraries require specific configuration to play nicely with Webpack - nwb can take care of the details for you if you use a `compat` object to tell it when you're using them. The following libraries are supported:

###### `enzyme`: `Boolean`

Set to `true` for [Enzyme](http://airbnb.io/enzyme/) compatibility - this assumes you're using the latest version of React (v15).

###### `json-schema`: `Boolean`

Set to `true` to prevent a transitive [json-schema](https://github.com/kriszyp/json-schema) dependency from [breaking your Webpack build](https://github.com/kriszyp/json-schema/issues/59). Failure in this case manifests itself something like so:

```
Error: define cannot be used indirect

webpack:///(webpack)/buildin/amd-define.js
```

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
      'json-schema': true,
      moment: {
        locales: ['de', 'en-gb', 'es', 'fr', 'it']
      },
      sinon: true
    }
  }
}
```

##### `extra`: `Object`

Extra configuration to be merged into the generated Webpack configuration using [webpack-merge](https://github.com/survivejs/webpack-merge#webpack-merge---merge-designed-for-webpack) - see the [Webpack configuration docs](https://webpack.github.io/docs/configuration.html) for the available fields.

Note that you *must* use Webpack's own config structure in this object - e.g. to add an extra loader which isn't managed by nwb's own `webpack.loaders` config, you would need to provide a list of loaders at `webpack.extra.module.loaders`.

```js
var path = require('path')

module.exports = function(nwb) {
  return {
    type: 'react-app',
    webpack: {
      extra: {
        // Example of adding an extra loader which isn't managed by nwb,
        // assuming you've installed html-loader in your project.
        module: {
          loaders: [
            {test: /\.html$/, loader: 'html'}
          ]
        },
        // Allow the use of require('images/blah.png') to require from an
        // src/images from anywhere in the the app.
        resolve: {
          alias: {
            'images': path.resolve('src/images')
          }
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

Karma defaults to using the Mocha framework and reporter plugins, but it's possible to configure your own, as well as where it looks for tests.

#### `karma`: `Object`

Karma configuration is defined in a `karma` object, using the following fields:

##### `tests`: `String`

By default, Karma will attempt to run tests from `'tests/**/*-test.js'` - you can configure this using the `tests` property.

e.g. if you want to colocate your tests with your source:

```js
module.exports = {
  karma: {
    tests: 'src/**/*-test.js'
  }
}
```

##### `frameworks`: `Array<String | Plugin>`

You must provide the plugin for any custom framework you want to use and manage it as a dependency yourself. Customise the testing framework plugin(s) Karma uses with the `frameworks` and `plugins` props:

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

If you're configuring frameworks and you want to use the Mocha framework managed by nwb, just pass its name as in the above example.

##### `reporters`: `Array<String | Plugin>`

Customising reporters follows the same principle as frameworks, just using the `reporters` prop instead.

For built-in reporters, or nwb's versfon of the Mocha reporter, just pass a name:

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

##### `plugins`: `Array<Plugin>`

A list of plugins to be loaded by Karma - this should be used in combination with `frameworks` and `reporters` as necessary.

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

#### `build`: `Object`

By default, `nwb build` creates an ES5 build of your React component or vanilla JS module's code for publishing to npm. Additional npm build configuration is defined in a `build` object, using the following fields:

##### `umd`: `Boolean`

Determines whether or not nwb will create a UMD build when you run `nwb build` for a React component or web module.

##### `global`: `String` (*required* for UMD build)

The name of the global variable the UMD build will export.

##### `externals`: `Object` (for UMD build)

A mapping from `peerDependency` module names to the global variables they're expected to be available as for use by the UMD build.

e.g. if you're creating a React component which also depends on [React Router](https://github.com/rackt/react-router), this configuration would ensure they're not included in the UMD build:

```js
module.exports = {
  build: {
    umd: true,
    global: 'MyComponent',
    externals: {
      'react': 'React',
      'react-router': 'ReactRouter'
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
 * nwb 0.6.0 - https://github.com/insin/nwb
 * MIT Licensed
 */
```

##### `jsNext`: `Boolean`

Determines whether or not nwb will create an ES6 modules build for tree-shaking module bundlers when you run `nwb build` for a React component or web module.

```js
module.exports = {
  build: {
    jsNext: true
  }
}
```

[autoprefixer]: https://github.com/postcss/autoprefixer/
[babel-loader]: https://github.com/babel/babel-loader/
[CSS Modules]: https://github.com/css-modules/css-modules/
[css-loader]: https://github.com/webpack/css-loader/
[file-loader]: https://github.com/webpack/file-loader/
[isparta-loader]: https://github.com/deepsweet/isparta-loader/
[json-loader]: https://github.com/webpack/json-loader/
[npm-install-loader]: https://github.com/ericclemmons/npm-install-loader/
[postcss-loader]: https://github.com/postcss/postcss-loader/
[style-loader]: https://github.com/webpack/style-loader/
[url-loader]: https://github.com/webpack/url-loader/
