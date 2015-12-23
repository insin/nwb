## Plugins

### CSS Preprocessors

CSS preprocessors provide a Webpack loader which processes modules written in alternative style languages, with the resulting CSS being passed through the standard nwb CSS pipeline.

* [nwb-less](https://github.com/insin/nwb-less) - adds processing of `.less` files
* [nwb-sass](https://github.com/insin/nwb-sass) - adds processing of `.scss` files
* [nwb-stylus](https://github.com/insin/nwb-stylus) - adds processing of `.styl` files

----

### Implementing Plugins

Plugins are implemented as npm packages which have names beginning with `'nwb-'`, which export a plugin configuration object.

nwb will scan the current project's `package.json` for these modules, then import them and merge their configuration objects for use when generating configurations.

#### Implementing CSS Preprocessors

CSS preprocessor plugins must export a configuration object in the following format:

   ```js
   {
      cssPreprocessors: {
        'preprocessor id here': {
          test: /\.regexp for filenames to be preprocessed$/,
          loader: 'absolute path to a webpack loader module.js',
          defaultConfig: 'default top-level webpack config prop for loader',
          ...{other: 'webpack loader config, e.g. default query config'}
        }
      }
   }
   ```

The preprocessor id is critical - this will be used to generate names for the style loaders created for the preprocessor, and this will be what users will use in their `nwb.config.js` to apply configuration to the preprocessor's webpack loader.

If the preprocessor's webpack loader supports reading configuration from a top-level webpack configuration property, its name should be configured as `defaultConfig`.

----

As a concrete example, this is a working implementation of a Sass preprocessor plugin:

```js
module.exports = {
  cssPreprocessors: {
    sass: {
      test: /\.scss$/,
      loader: require.resolve('sass-loader'),
      defaultConfig: 'sassLoader'
    }
  }
}

```

Given the above, nwb will create these additional Webpack loaders:

1. A `sass-pipeline` loader which handles the app's own `.scss` and chains the following loaders:

  - sass (id: `sass`)
    - autoprefixer (id: `sass-autoprefixer`)
      - css (`sass-css`)
        - style `sass-style` (only when serving)

1. A `vendor-sass-pipeline` loader which handles `.scss` required from node_modules, using the same chain of loaders with different ids:

  - sass (id: `vendor-sass`)
    - autoprefixer (id: `vendor-sass-autoprefixer`)
      - css (`vendor-sass-css`)
        - style `vendor-sass-style` (only when serving)
