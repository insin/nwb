## Implementing Plugins

Plugins are implemented as npm packages which have names beginning with `'nwb-'`, which export a plugin configuration object.

nwb will scan the current project's `package.json` for these modules, then import them and merge their configuration objects for use when generating configurations.

### CSS Preprocessor Plugins

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

As a concrete example, this is a complete implementation of a Sass preprocessor plugin:

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
