## Configuration

nwb will look for an `nwb.config.js` file in the current working directory for project-specific configuration.

This file should export either a configuration object or a function which creates a configuration object. In the case of a function, it will be called *after* nwb has ensured the appropriate `NODE_ENV` environment variable has been set for the command being run.

### Configuration Object Fields

The object exported or returned by your nwb config can use the following fields.

#### `type`: `String` (required)

This field is used to determine which type of module nwb is working with when a generic builds command like `build` are run.

It must be one of:

* `'react-app'`
* `'react-component'`
* `'web-module'`

#### `babel`: `Object`

Use this field to provide your own options for Babel (version 5) - [see the Babel 5 options documentation](https://github.com/babel/babel.github.io/blob/862b43db93e48762671267034a50c30c00e433e2/docs/usage/options.md).

e.g. to use `async`/`await` transforms, you will need to configure Babel's `stage` and `optional` settings:

```js
module.exports = {
  // ...
  babel: {
    stage: 0,
    optional: ['runtime']
  }
}
```

If provided, this config will also be used to configure the `babel-loader` Webpack loader if there isn't any other configuration specified for it in [`loaders`](#loaders-object).

#### `define`: `Object`

By default, nwb will use Webpack's `DefinePlugin` to replace all occurances of `process.env.NODE_ENV` with a string containing `NODE_ENV`'s current value.

You can configure a `define` object to add your own constant values.

e.g. to replace all occurrences of `__VERSION__` with a string containing your app's version from its `package.json`:

```js
module.exports = {
  define: {
    __VERSION__: JSON.stringify(require('./package.json').version)
  }
}
```

#### jsNext: `Boolean`

Determines whether or not nwb will create an ES6 modules build for tree-shaking module bundlers when you run `nwb build` for a React component or web module.

Defaults to `true`.

#### `umd`: `Boolean`

Determines whether or not nwb will create a UMD build when you run `nwb build` for a React component or web module.

Defaults to `true` when you are prompted to onfigure this by `nwb new`, or if you provide a UMD global variable as a command-line argument.

#### `externals`: `Object` (only for UMD builds)

A mapping from `peerDependency` module names to the global variables they're expected to be available as for use by the UMD build.

e.g. if you're creating a React component which also depends on [React Router](https://github.com/rackt/react-router):

```js
module.exports = {
  externals: {
    'react': 'React',
    'react-router': 'ReactRouter'
  }
}
```

#### `global`: `String` (*required* for UMD builds)

The name of the global variable the UMD build will export.

You will be prompted to configure this if you choose to enable a UMD build when creating a React component or web module with `nwb new`.

#### `karma`: `Object`

Karma defaults to using the Mocha framework and reporter plugins, but it's possible to configure your own, as well as where it looks for tests.

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

#### `loaders`: `Object`

Each [Webpack loader](https://webpack.github.io/docs/loaders.html) configured by default has a unique id you can use to customise it.

To customise a loader, add a prop to the `loaders` object matching its id and pass a configuration object.

Refer to each loader's documentation for configuration options which can be set via `query`.

e.g., to enable [CSS Modules][CSS Modules]:

```js
module.exports = {
  loaders: {
    css: {
      query: {
        modules: true
      }
    }
  }
}
```

If a loader supports configuration via a top-level webpack configuration property, this can be provided as `config`. This is primarily for loaders which can't be configured via `query` as they have configuration which can't be serialised, such as instances of plugins.

e.g. to use the `nib` plugin with the [Stylus](http://learnboost.github.io/stylus/) preprocessor provided by [nwb-stylus](https://github.com/insin/nwb-stylus):

```js
var nib = require('nib')

module.exports = {
  loaders: {
    stylus: {
      config: {
        use: [nib()]
      }
    }
  }
}
```

##### Default loaders

Default loaders and their ids are:

* `babel` - handles `.js` and `.jsx` files with [babel-loader][babel-loader]

  > Default config: `{exclude: /node_modules/}`

* `css-pipeline` - handles your app's own`.css` files by chaining together a number of loaders:

  > Default config: `{exclude: /node_modules/}`

  Chained loaders are:

  * `style` - (only when serving) applies styles using [style-loader][style-loader]
  * `css` - handles URLs, minification and CSS Modules using [css-loader][css-loader]
  * `autoprefixer` - automatically adds vendor prefixes to CSS using [autoprefixer-loader][autoprefixer-loader]

* `vendor-css-pipeline` - handles `.css` files required from `node_modules`, with the same set of chained loaders as `css-pipeline` but with a `vendor-` prefix in their id.

  > Default config: `{include: /node_modules/}`

* `graphics` - handles `.gif` and `.png` files using using [url-loader][url-loader]

  > Default config: `{query: {limit: 10240}}`

* `jpeg` - handles `.jpeg` files using [file-loader][file-loader]

* `fonts` - handles `.otf`, `.svg`, `.ttf`, `.woff` and `.woff2` files using [url-loader][url-loader]

  > Default config: `{query: {limit: 10240}}`

* `eot` - handles `.eot` files using [file-loader][file-loader]

* `json` - handles `.json` files using [json-loader][json-loader]

##### Test loaders

When running Karma tests with coverage enabled, the following loader will be added:

* `isparta` - handles instrumentation of source files for coverage analysis [isparta-loader][isparta-loader]

  > Default config: `{include: path.join(cwd, 'src')}` (where cwd is the directory you ran `nwb test` from).

  You may need to tweak this loader if you're [changing where Karma looks for tests](#tests-string) - e.g. if you're colocating tests in `__tests__` directories, you will want to configure isparta-loader to ignore these:

  ```js
  module.exports = {
    loaders: {
      isparta: {
        exclude: /__tests__/
      }
    }
  }
  ```

##### `loaders.extra`: `Array`

If you provide an `extra` prop in the `loaders` object with a list of loader configuration objects, they will be added to the Webpack configuration.

This is currently a crude escape hatch for adding more loaders.

## `package.json` UMD Banner Configuration

The banner comment added to UMD builds will use as many of the following `package.json` fields as are present:

* `name`
* `version`
* `homepage`
* `license`

[autoprefixer-loader]: https://github.com/passy/autoprefixer-loader/
[babel-loader]: https://github.com/babel/babel-loader
[CSS Modules]: https://github.com/css-modules/css-modules
[css-loader]: https://github.com/webpack/css-loader/
[file-loader]: https://github.com/webpack/file-loader/
[isparta-loader]: https://github.com/deepsweet/isparta-loader
[json-loader]: https://github.com/webpack/json-loader/
[style-loader]: https://github.com/webpack/style-loader/
[url-loader]: https://github.com/webpack/url-loader/
