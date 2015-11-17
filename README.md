# nwb - npm web builder

[![npm package][npm-badge]][npm]

**Note: nwb initially scratches a personal itch - hence the very specific list of conventions below - configurability, flexibility, templating etc. may come later**

nwb manages npm dependencies and configuration of development tools you can use to build, test, and distribute:

* npm modules which are intended to be run in the browser using a bundling tool or a UMD build - e.g. React components, form helpers - referred to as "web modules" from here on for clarity
* client apps which use npm for dependencies and need to be bundled for deployment

It provides an `nwb` command to run these pre-configured tools on your web module or app, so you don't have to repeat the same configuration over and over again in multiple repositories.

```
npm install -g nwb
```

## `nwb` commands

Run `nwb` commands in your web module or app's root directory (containing its `package.json`):

```
Usage: nwb <command>

Options:
  -h, --help    display this help message
  -v, --version print nwb's version

Common commands:
  build         clean and build app if public/ is present, otherwise build module
  clean         clean app if public/ is present, otherwise clean-module
  test          start running *-test.js unit tests in test/

Web app commands:
  build-app     build src/index.js into public/build/
  clean-app     delete public/build/

Web module commands:
  build-module  transpile from src/ into lib/
  build-umd     create UMD builds from src/index.js into umd/
  clean-module  delete lib/ and umd/
  dist          clean and build module and demo app (if present)

Web module demo app commands:
  build-demo    build demo app from demo/src/index.js into demo/dist/
  clean-demo    delete demo/dist/
  dist-demo     clean and build demo app

React-specific commands:
  build-react-app     build app with Babel production optimisations for React
  serve-react <file>  serve a React entry module with hot reloading
  serve-react-app     serve src/index.js with hot reloading
```

## Example repos

[nwb-app-template](https://github.com/insin/nwb-app-template) is a minimal web app which can be cloned as a starting point.

[nwb-module-template](https://github.com/insin/nwb-module-template) is a minimal web module which can be cloned as a starting point.

[get-form-data](https://github.com/insin/get-form-data) is a module which is developed and prepared for npm publishing with nwb.

[react-auto-form](https://github.com/insin/react-auto-form) is a module which uses nwb's `externals` config for its `peerDependencies` and has a React demo app which is also built by nwb.

## Common conventions

The conventions nwb currently assumes for all builds are:

**Dependencies**

1. Your dependencies are managed by [npm](https://www.npmjs.com/)

**Source**

1. Your code uses ES6 features for convenience rather than depending on high compliancy with the ES6 spec, so can be transpiled with [Babel](http://babeljs.io) 5's loose mode

**Unit testing**

1. Your unit tests are:
   1. in `*-test.js` files underneath `test/`
   1. written with [tape](https://github.com/substack/tape)
   1. able to run on PhantomJS 1.x (with `Function.prototype.bind()` polyfilled)
   1. able to assume that a top-level `src` package is aliased to `src/`

      e.g. these imports are equivalent in `test/index-test.js`

      ```javascript
      import MyThing from '../src/index'
      import MyThing from 'src/index'
      ```

## App conventions

The conventions nwb currently assumes for a web app are:

**Source**

1. Your app:
  1. has its entry point at `src/index.js`
  1. uses `import` or `require()` for its CSS and image dependencies

**Build**

1. Your app has its HTML entry point at `public/index.html`

1. Your app builds into `public/build/` and:
   1. uses a `vendor.js` bundle for dependencies loaded out of node_modules
   1. uses an `app.js` bundle for all other code
   1. uses a `style.css` bundle for all CSS

## Web module conventions

The conventions nwb currently assumes for a web module are:

**Environments**

1. Your module is capable of running on both [Node.js](https://nodejs.org) and browsers as part of a progressively rendered web application

**Source**

1. Your module:
  1. has its entry point at `src/index.js`
     1. which is pointed to by a `jsnext:main` field in `package.json`
  1. uses ES6 module syntax, to allow consumption by [Rollup](https://github.com/rollup/rollup)/[Webpack 2](https://github.com/webpack/webpack/pull/861) (or similar tree-shaking tools)

**Distribution**

1. Your module is distributed in `lib/` as an ES5 build for consumption by Node.js and [Webpack](https://github.com/webpack/webpack/)/[Browserify](https://github.com/substack/node-browserify) (or similar bundling tools), and:
  1. its entry point is located at `lib/index.js`
     1. which is pointed to by the `main` field in `package.json`

1. Your module is distributed in `umd/` as a UMD build for global namespace consumption via [npmcdn](https://npmcdn.com) (or similar services), with all its non-peer dependencies bundled, and:
  1. UMD builds are located at `umd/<package.name>.js` and `umd/<package.name>.min.js`

**Demo app**

1. If your module has a demo app:
  1. its entry point is located at `demo/src/index.js`
  1. it's capable of bootstrapping itself from an empty `<body>`
  1. it uses `import` or `require()` for its CSS and image dependencies

**Services**

1. Your module's source is hosted on [GitHub](https://github.com)

1. Your module uses [Travis CI](https://travis-ci.org/) for integration testing

1. Your module uses [Codecov](https://codecov.io) for code coverage monitoring

### UMD build `package.json` configuration

Everything which can vary in the UMD build provided by `nwb` is configured in `package.json` - these are the fields it requires:

* `name` - used in the UMD build banner
* `version` - used in the UMD build banner
* `homepage` - used in the UMD build banner
* `license` - used in the UMD build banner
* `global` - the name of the global variable the UMD build will export

The following fields will be used if present:

* `externals` - a mapping from package names the module depends on which are expected to be available as global variables for use by the UMD build, to the global variable names they're expected to use

  e.g. if your package is a React component which also makes use of React Router:

  ```json
  {
    "externals": {
      "react": "React",
      "react-router": "ReactRouter"
    }
  }
  ```

## MIT Licensed

[npm-badge]: https://img.shields.io/npm/v/nwb.svg
[npm]: https://www.npmjs.org/package/nwb
