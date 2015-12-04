Added:

- Express [middleware](https://github.com/insin/nwb/blob/master/docs/Middleware.md#middleware) for running a React app on your own development server using nwb's Webpack config generation.

Changed:

- Webpack loader config objects are now merged with [webpack-merge](https://github.com/survivejs/webpack-merge); query objects will now be deep merged, with lists occurring at the same position in build and user config being concatenated instead of overwritten.

Fixed:

- babel-runtime can now be resolved from nwb's dependencies when using `optional: ['runtime']` Babel config.

# 0.1.0 / 2015-12-02

First 0.x release.
