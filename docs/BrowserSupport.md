## Browser Support

nwb's default configuration supports modern browsers. Support for Internet Explorer 9, 10 and 11 requires [polyfills](#supporting-internet-explorer).

### Default Browser Support

nwb uses the following [Browserslist](https://github.com/browserslist/browserslist#browserslist-) queries by default:

- [`last 1 chrome version, last 1 firefox version, last 1 safari version`](https://browserl.ist/?q=last+1+chrome+version%2C+last+1+firefox+version%2C+last+1+safari+version) for development, when running the development server with `nwb serve` (or quick commands such as `npm react run`)
- [`>0.2%, not dead, not op_mini all`](https://browserl.ist/?q=%3E0.2%25%2C+not+dead%2C+not+op_mini+all) for production, when creating a build with `nwb build` (or quick commands such as `npm react build`)

> Use the links above to check which browsers and versions these queries currently resolve to.

These are used to configure:

- [Babel's `targets` option](https://babeljs.io/docs/en/options#targets), so it only transpiles the necessary ECMAScript 2015+ for supported browsers.
- [Autoprefixer's `overrideBrowserslist` option](https://github.com/postcss/autoprefixer#options), so it only includes the necessary CSS prefixes for supported browsers.

### Configuring Browser Support

If your app needs to support more (or fewer!) browsers, you can tweak browser support settings using [`browsers` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#browsers-string--arraystring--object).

Broadening the range of supported browsers will ensure your app works for everone who needs to use it, while narrowing the range may help decrease your bundle sizes, if less code needs to be transpiled and fewer Babel helpers need to be imported.

For example, IE9 is considered a "dead" browser in Browserslist queries, so if you needed to support it, you could specifically enable it in [`browsers.production` config](https://github.com/insin/nwb/blob/master/docs/Configuration.md#browsers-string--arraystring--object) like so:

```js
module.exports = {
  browsers {
    production: '>0.2%, not dead, not op_mini all, ie 9'
  }
}
```

You can see that [IE 9 has now been added](https://browserl.ist/?q=%3E0.2%25%2C+not+dead%2C+not+op_mini+all%2C+ie+9) to the list of supported browsers.

## Polyfilling Missing Language Features

### Supporting Internet Explorer

[react-app-polyfill](https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill#react-app-polyfill) provides convenient collection of polyfills for IE9 and IE11.

If you need to support Internet Explorer, install react-app-polyfill and import the appropriate polyfill entry point as the first thing in your app's entry point (usually `src/index.js`):

```
npm install react-app-polyfill
```
```js
import 'react-app-polyfill/ie11'
```

See [react-app-polyfill's Supporting Internet Explorer docs](https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill#supporting-internet-explorer) for more details.

### Manual Polyfilling

If there are specific language features missing from one of your supported browsers, you can polyfill them manually by installing [core-js](https://github.com/zloirock/core-js#core-js) and importing the appropriate polyfills at the top of your app's entry point (usually `src/index.js`).

e.g. if you want to use [`Object.values()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values) in your app, but one of your target browsers doesn't support it:

```
npm install core-js
```
```js
import 'core-js/features/object/values'
```

### Automatic Polyfilling

nwb configures `@babel/preset-env`'s [`useBuiltins: 'entry'` option](https://babeljs.io/docs/en/next/babel-preset-env), which will look for a core-js entry point import in your code and replace it with a specific list of polyfill imports to cover the range of supported browsers. See the [core-js docs for an example of this feature in action](https://github.com/zloirock/core-js#babelpreset-env).

To make use of this, import a core-js entry point at the top of your app's entry point (usually `src/index.js`):

```js
import 'core-js/stable'
```

react-app-polyfill also provides [an entry point for polyfilling stable language features using core-js](https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill#polyfilling-other-language-features), so nwb's Babel config supports transpiling react-app-polyfill to allow `@babel/preset-env` to do its thing:

```js
import 'react-app-polyfill/stable'
```
