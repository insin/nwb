## Plugins

Plugin modules provide additional functionality - if you have one installed in your project, nwb will automatically find it when creating configuration and integrate the functionality it provides.

### CSS Preprocessor Plugins

CSS preprocessors convert styles in alternative style languages to CSS, with the resulting CSS being passed through the standard nwb CSS pipeline.

- [nwb-less](https://github.com/insin/nwb-less) - adds processing of `.less` files which use [Less syntax](http://lesscss.org/) with [less-loader](https://github.com/webpack-contrib/less-loader#readme).
- [nwb-sass](https://github.com/insin/nwb-sass) - adds processing of `.scss` and `.sass` files which use [Sass syntax](http://sass-lang.com/) with [sass-loader](https://github.com/jtangelder/sass-loader#readme)
- [nwb-stylus](https://github.com/insin/nwb-stylus) - adds processing of `.styl` files which use [Stylus syntax](http://stylus-lang.com/) with [stylus-loader](https://github.com/shama/stylus-loader#readme)

#### Example: using the Sass plugin

If you want to use Sass in your project, install nwb-sass...

```
npm install --save-dev nwb-sass
```

...and you can now import `.scss` or `.sass` files from JavaScript modules:

```js
import './styles.scss'
```

The sass plugin's unique id is `sass` - you can use this in [`webpack.rules` config](/docs/Configuration.md#rules-object) to provide configuration options for sass-loader:

```js
module.exports = {
  webpack: {
    rules: {
      sass: {
        data: '@import "_variables"',
        includePaths: [path.resolve('src/styles')]
      }
    }
  }
}
```
