## Frequently Asked Questions

### How do I enable CSS Modules?

Use `nwb.config.js` to configure the [default `css` loader for your app's own styles](/docs/Configuration.md#default-loaders) with the necessary [css-loader `query` parameters](https://github.com/webpack/css-loader#local-scope):

```js
module.exports = {
  webpack: {
    loaders: {
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

### Why am I seeing `.json.gzip` files in my project root?

Are you running as root on a Mac, or in a Docker container?

npm appers to [set the working directory as the temporary directory](https://github.com/npm/npm/issues/4531) in these scenarios and babel-loader writes to the temporary directory to cache results for performance.
