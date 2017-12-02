## Frequently Asked Questions

- [What does "nwb" stand for?](#what-does-nwb-stand-for)
- [How can I view the configuration nwb generates?](#how-can-i-view-the-configuration-nwb-generates)
- [How do I enable CSS Modules?](#how-do-i-enable-css-modules)
- [What can I configure to reduce bundle size?](#what-can-i-configure-to-reduce-bundle-size)
- [How can I copy non-JavaScript files when building a React component/library?](#how-can-i-copy-non-javascript-files-when-building-a-react-component-library)
- [How can I use React Hot Loader instead of React Transform?](how-can-i-use-react-hot-loader-instead-of-react-transform)

---

### What does "nwb" stand for?

Shortness and ease of typing.

It uses **N**ode.js, **W**ebpack and **B**abel to **b**uild apps for the **w**eb and modules for **n**pm.

`nwb` sounded like the best combination of those and was easy to type.

### How can I view the configuration nwb generates?

Set the `DEBUG` environment variable to `nwb` before running to check what generated configuration looks like:

```
# *nix
export DEBUG=nwb
# Windows
set DEBUG=nwb
```

If you need to prevent server commands from clearing scrollback so you can read any unexpected error logging which is happening, set the `NWB_TEST` environment variable to `true`:

```
# *nix
export NWB_TEST=true
# Windows
set NWB_TEST=true
```

### How do I enable CSS Modules?

Use [`webpack.rules` config](/docs/Configuration.md#rules-object) in `nwb.config.js` to [configure `css-loader` in the default stylesheet rule](/docs/Stylesheets.md#default-stylesheet-rules) with the necessary [`css-loader` options](https://github.com/webpack-contrib/css-loader#options):

```js
module.exports = {
  webpack: {
    rules: {
      css: {
        modules: true,
        localIdentName: (
          process.env.NODE_ENV === 'production'
            ? '[path][name]-[local]-[hash:base64:5]'
            : '[hash:base64:5]'
        )
      }
    }
  }
}
```

If you only need CSS Modules for some of the stylesheets you'll be importing, you can configure [custom stylesheet rules](/docs/Stylesheets.md#custom-stylesheet-rules).

### What can I configure to reduce bundle size?

#### Disable default polyfills

If you don't need the `Promise`, `fetch` and `Object.assign` polyfills nwb provides by default, configuring [`polyfill: false`](/docs/Configuration.md#polyfill-boolean) (or passing a [`--no-polyfill` flag](/docs/guides/QuickDevelopment.md#options-for-run-and-build-commands) when using Quick Development commands) will shave ~4KB off the gzipped vendor bundle.

#### Enable cherry-picking for destructuring imports

If you're using destructuring imports with libraries like React Router and React Bootstrap (e.g. `import {Button} from 'react-bootstrap'`), you're bundling the whole library, instead of just the bits you need.

Try configuring [`babel.cherryPick`](/docs/Configuration.md#cherrypick-string--arraystring) for these libraries to only bundle the modules you actually use.

### How can I copy non-JavaScript files when building a React component/library?

Pass a [`--copy-files` flag](/docs/guides/ReactComponent.md#--copy-files) if you have other files which you want to copy to build directories, such as CSS and JSON files.

### How can I use [React Hot Loader](https://github.com/gaearon/react-hot-loader) instead of [React Transform](https://github.com/gaearon/babel-plugin-react-transform)?

> [React Transform](https://github.com/gaearon/babel-plugin-react-transform) is deprecated in favour of [React Hot Loader](https://github.com/gaearon/react-hot-loader), but nwb is still using the former as it can be activated entirely via the configuration nwb manages, whereas React Hot Loader requires a component to be added to your app.

- `npm install react-hot-loader`
- Disable use of React Transform by passing a [`--no-hmre` flag](https://github.com/insin/nwb/blob/master/docs/Commands.md#nwb-serve) to the `serve` command you're using. e.g. in your app's `package.json`:

  ```json
  {
    "scripts": {
      "start": "nwb serve-react-app --no-hmre",
    }
  }
  ```
- Provide the Babel and Webpack config React Hot Loader requires in your `nwb.config.js`:

  ```js
  module.exports = function({command}) {
    let config = {
      type: 'react-app'
    }
    // Only include react-hot-loader config when serving a development build
    if (command.startsWith('serve')) {
      config.babel = {plugins: 'react-hot-loader/babel'}
      config.webpack = {
        config(webpackConfig) {
          // React Hot Loader's patch module needs to run before your app
          webpackConfig.entry.unshift('react-hot-loader/patch')
          return webpackConfig
        }
      }
    }
    return config
  }
  ```
- Use React Hot Loader's `<AppContainer>` component in your app's entry module (usually `src/index.js` in apps using nwb) as per its [Getting Started docs](https://github.com/gaearon/react-hot-loader#getting-started).
