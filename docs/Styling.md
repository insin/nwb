## Styling

nwb generates Webpack `module.rules` configuration which allows you to import stylesheets directly from JavaScript modules.

When running a development server, imported stylesheets will be injected into the page using `<style>` elements and hot-reloaded when they changed.

When running a build, imported stylesheets will be extracted to static `.css` files.

### Default Style Rules

Without any [`webpack.styles` configuration](/docs/Configuration.md#styles-object--false--old), nwb generates Webpack rules which chain loaders together to allow you to import stylesheets.

Each loader has a unique id associated with it which you can use in `webpack.rules` config to override the default configuration.

#### Default Loaders

- `style-loader`
- `css-loader`
- `postcss-loader`

#### CSS

Importing `.css` files is supported by default

- `css-rule`
- `style`
- `css`
- `postcss`

#### CSS Preprocessor Plugins

A rule is also generate for each CSS preprocessor plugin you have installed.

e.g. ids which can be used to customise the default rule and loaders for `nwb-sass`:

- `sass-rule`
- `sass-style`
- `sass-css`
- `sass-postcss`
- `sass`

### Custom Style Rules

If your application needs more complex stylesheet handling, you can configure custom style rules using [`webpack.styles` config](/docs/Configuration.md#styles-object--false--old).

This should be an object defining lists of style rule configuration objects, with properties named for the type of rule being configured.

Vanilla CSS rules are configured with a `css` property and CSS preprocessor plugin rules are configured using the appropriate name, e.g. `sass` when using `nwb-sass`.

```js
module.exports = {
  webpack: {
    styles: {
      css: [/* ... */],
      sass: [/* ... */]
    }
  }
}
```

#### Style Rule Configuration Objects

Each style rule configuration object generates a rule with chained loaders similar to the default configuration detailed above: `style-loader`, `css-loader`, `postcss-loader` and the loader for any CSS preprocessor plugins you're using.

##### Files

A style rule configuration object can specify which files the rule applies to using `test`, `include` and `exclude` properties. Default `test` config will be provided for each style type - e.g. `/\.css$/` for `css` rules - but you can override it if necessary.

##### Loader Options

Loaders options can be configured using a property which matches the loader's name: `style`, `css` and `postcss` It can also use the name of each loader used within the rule to specify loader options.
c
e.g. to configure use of CSS modules within a specific directory:

```js
// Configures css-loader to use CSS Modules for CSS imported from src/components
{
  include: path.resolve('src/components')
  // The 'css' property within a style rule configures options for css-loader
  css: {
    modules: true,
    localIdentName: (
      process.env.NODE_ENV === 'production'
        ? '[path][name]-[local]-[hash:base64:5]'
        : '[hash:base64:5]'
    )
  }
}
```

With this rule alone, CSS imported from other directories, including `node_modules/`, won't be handled, so we should specify another rule to handle everything else:

```js
// Handle importing vanilla CSS from everywhere but src/components.
{
  exclude: path.resolve('src/components')
}
```

Putting these together, the final style rule config would look like this:

```js
module.exports = {
  webpack: {
    // Custom style rule configuration
    styles: {
      // The 'css' property is used to configure rules for vanilla CSS files
      css: [
        // Create a rule which uses CSS modules for CSS imported from a specific directory
        {
          include: path.resolve('src/components')
          // Configuration options for css-loader
          css: {
            modules: true,
            localIdentName: (
              process.env.NODE_ENV === 'production'
                ? '[path][name]-[local]-[hash:base64:5]'
                : '[hash:base64:5]'
            )
          }
        },
        // Create a catch-all rule for all other CSS stylesheets
        {
          exclude: path.resolve('src/components')
        }
      ]
    }
  }
}
```

Using this configuration, it's possible to specify multiple rules for stylesheets imported by your app and your dependencies.

For example, [React Toolbox]() is a dependency which imports stylesheets on your behalf and requires a specific Webpack rule setup with CSS Modules and PostCSS-cssnext.

```js
var reactToolboxVariables = {
  'button-height': '30px'
}

module.exports = {
  webpack: {
    styles: {
      // Specify custom rules for CSS files
      css: [
        // Create a rule which provides the setup react-toolbox@2.0 needs
        {
          include: 'react-toolbox',
          // The 'css' property within a style rule configures options for
          // css-loader.
          css: {
            modules: true,
            sourceMap: true,
            localIdentName: "[name]--[local]--[hash:base64:8]"
          },
          // The 'postcss' property within a style rule configures options for
          // postcss-loader.
          postcss: {
            plugins: [
              require('postcss-cssnext')({
                features: {
                  customProperties: {
                    variables: reactToolboxVariables
                  }
                }
              }),
              require('postcss-modules-values'),
            ]
          }
        },
        // Create another rule for our app's own CSS
        {
          include: path.resolve('src')
        }
      ]
    }
  }
}
```

### Disabling Style Rules

If you want to handle creating style rules manually, you can disable nwb's default rules by configuring `webpack.styles` as `false`:

```js
module.exports = {
  webpack: {
    styles: false
  }
}
```

If you need to use any of the Webpack loaders nwb manages dependencies for - e.g. `css-loader` and `postcss-loader` - refer to them by loader name in your [`webpack.extra` config](/docs/Configuration.md#extra-object) or [`webpack.config` function](#config-function). nwb configures Webpack to resolve these loaders correctly if they're not installed locally in your project.

### Old Style Rules

> Note: This feature is provided to aid gradual migration to nwb v0.16's new style configuration - using it will trigger deprecation warnings, as it will be removed in a future release.

To use the default style rules from earlier versions of nwb (<= v0.15), configure `webpack.styles` as `'old'`:

```js
module.exports = {
  webpack: {
    styles: 'old'
  }
}
```
