## Frequently Asked Questions

- [What does "nwb" stand for?](#what-does-nwb-stand-for)
- [How can I view the configuration nwb generates?](#how-can-i-view-the-configuration-nwb-generates)
- [How do I enable CSS Modules?](#how-do-i-enable-css-modules)
- [What can I configure to reduce bundle size?](#what-can-i-configure-to-reduce-bundle-size)

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

Use `nwb.config.js` to configure the [default `css` rule for your app's own styles](/docs/Configuration.md#default-rules) with the necessary [css-loader `option` parameters](https://github.com/webpack/css-loader#local-scope):

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

### What can I configure to reduce bundle size?

If you don't need the `Promise`, `fetch` and `Object.assign` polyfills nwb provides by default, configuring [`polyfill: false`](/docs/Configuration.md#polyfill-boolean) will shave ~4KB off the gzipped vendor bundle.

Configuring [`webpack.extractText.allChunks: true`](/docs/Configuration.md#extracttext-object) will shave ~1.25KB off the gzipped vendor bundle by excluding the runtime for Webpack's style-loader.

If you're using destructuring imports with libraries like React Router and React Bootstrap (e.g. `import {Button} from 'react-bootstrap'`), you're bundling the whole library, instead of just the bits you need. Try configuring [`babel.cherryPick`](/docs/Configuration.md#cherrypick-string--arraystring) for these libraries to only bundle the modules you actually use.
