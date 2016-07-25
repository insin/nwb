## Plugins

Plugin modules provide additional functionality - if you have one installed in your project, nwb will automatically find it when creating configuration and integrate the functionality it provides .

### CSS Preprocessors

CSS preprocessors convert styles in alternative style languages to CSS, with the resulting CSS being passed through the standard nwb CSS pipeline.

- [nwb-less](https://github.com/insin/nwb-less) - adds processing of `.less` files which use [Less syntax](http://lesscss.org/)
- [nwb-sass](https://github.com/insin/nwb-sass) - adds processing of `.scss` files which use [Sass syntax](http://sass-lang.com/)
- [nwb-stylus](https://github.com/insin/nwb-stylus) - adds processing of `.styl` files which use [Stylus syntax](http://stylus-lang.com/)

e.g. if you want to use Sass in your project, install nwb-sass...

```
npm install --save-dev nwb-sass
```

...and you can now import `.scss` files:

```js
require('./styles.scss')
```

----

### Implementing Plugins

Plugins are implemented as npm packages which have names beginning with `'nwb-'`, which export a plugin configuration object.

nwb will scan the current project's `package.json` for these modules, then import them and merge their configuration objects for use when generating configurations.

#### Implementing CSS Preprocessors

CSS preprocessor plugins must export a configuration object in the following format:

   ```js
   {
      cssPreprocessors: {
        'unique preprocessor id': {
          test: /\.fileextension$/,
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

As a concrete example, this is a complete, working implementation of a Sass preprocessor plugin:

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
    - postcss (id: `sass-postcss`)
      - css (`sass-css`)
        - style `sass-style` (only when serving)

1. A `vendor-sass-pipeline` loader which handles `.scss` required from node_modules, using the same chain of loaders with different ids:

  - sass (id: `vendor-sass`)
    - postcss (id: `vendor-sass-postcss`)
      - css (`vendor-sass-css`)
        - style `vendor-sass-style` (only when serving)
