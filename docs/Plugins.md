## Plugins

Plugin modules provide additional functionality - if you have one installed in your project, nwb will automatically find it when creating configuration and integrate the functionality it provides.

### CSS Preprocessor Plugins

CSS preprocessors convert styles in alternative style languages to CSS, with the resulting CSS being passed through the standard nwb CSS pipeline.

- [nwb-less](https://github.com/insin/nwb-less) - adds processing of `.less` files which use [Less syntax](http://lesscss.org/)
- [nwb-sass](https://github.com/insin/nwb-sass) - adds processing of `.scss` and `.sass` files which use [Sass syntax](http://sass-lang.com/)
- [nwb-stylus](https://github.com/insin/nwb-stylus) - adds processing of `.styl` files which use [Stylus syntax](http://stylus-lang.com/)

e.g. if you want to use Sass in your project, install nwb-sass...

```
npm install --save-dev nwb-sass
```

...and you can now import `.scss` or `.sass` files:

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
      'preprocessor-id': {
        test: /\.ext$/,
        loader: 'absolute path to a webpack loader module.js',
        // Other rule config, e.g. default options
      }
    }
 }
   ```

The preprocessor id is critical - this will be used to generate names for the Webpack rules and loaders created for the preprocessor, which users can use in their `nwb.config.js` to apply configuration.

----

As a concrete example, this is a complete, working implementation of a Sass preprocessor plugin:

```js
module.exports = {
  cssPreprocessors: {
    sass: {
      test: /\.s[ac]ss$/,
      loader: require.resolve('sass-loader')
    }
  }
}
```
