# nwb - npm web builder

Owns all the dependencies you need to lint, build, test, distribute and demo an npm web module and provides an `nwb` command to run them in the context of your module, so you don't have to repeat this configuration over and over again in multiple projects.

**Note: this tool initially scratches a personal itch - hence the very specific list of conventions below - configurability, flexibility, templating etc. may come later**

```
npm install -g nwb
```

## Conventions

The conventions it currently assumes are:

**Environments**

1. Your module is capable of running on both [Node.js](https://nodejs.or) and browsers as part of a progressively rendered web application

**Dependencies**

1. Your module's dependencies are managed by [npm](https://www.npmjs.com/)

**Source**

1. Your module:
  1. has its entry point at `src/index.js`
     1. which is pointed to by a `jsnext:main` field in `package.json`
  1. uses ES6 module syntax, to allow consumption by [Rollup](https://github.com/rollup/rollup) (or similar tools)
  1. uses ES6 features for convenience rather than depending on high compliancy with the ES6 spec, so can be transpiled with [Babel](http://babeljs.io) 5's default stage (2) and loose mode
  1. complies with [standard style](https://github.com/feross/standard) plus a [few tweaks](https://github.com/insin/nwb/blob/master/.eslintrc)

**Distribution**

1. Your module is distributed in `lib/` as an ES5 build for consumption by Node.js and [Webpack](https://github.com/webpack/webpack/)/[Browserify](https://github.com/substack/node-browserify) (or similar tools), and:
  1. its entry point is located at `lib/index.js`
     1. which is pointed to by the `main` field in `package.json`

1. Your module is distributed in `umd/` as a UMD build for global namespace consumption via [npmcdn](https://npmcdn.com) (or similar services), with all its non-peer dependencies bundled, and:
  1. its entry point is located at `umd/<package.name>.js` and `umd/<package.name>.min.js`
     1. one of which pointed to by a `umd` field in `package.json`

**Testing**

1. Your module's tests are:
   1. in `*-test.js` files underneath `test/`
   1. written with [tape](https://github.com/substack/tape)
   1. able to run on PhantomJS 1.x (with `Function.prototype.bind()` polyfilled)
   1. able to assume that a top-level `src` package is aliased to `src/`

      e.g. these imports are equivalent in `test/index-test.js`

      ```javascript
      import MyThing from '../src/index'
      import MyThing from 'src/index'
      ```

**Demo**

1. If your module has a demo page:
  1. its entry point is located at `demo/src/app.js`
  1. it's capable of bootstrapping itself from an empty HTML document
  1. it uses `import` or `require()` to pull in all of its JavaScript, CSS and image dependencies

**Services**

1. Your module's source is hosted on [GitHub](https://github.com)

1. Your module uses [Travis CI](https://travis-ci.org/) for integration testing

1. Your module uses [Codecov](https://codecov.io) for code coverage monitoring

## UMD build `package.json` configuration

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
    },
  }
  ```

## Commands

Usage, from a module's root directory (containing its `package.json`):

```
nwb <command>
```

### Module commands

* `dist` - lints code, cleans and builds all distributions; also runs `dist-demo` if `demo/` exists
* `test` - lints code and runs tests
* `lint` - lints `src/` and `test/`
* `clean` - deletes `lib/` and `umd/`
* `build` - builds the ES5 distribution in `lib/`
* `build-umd` - builds the UMD distribution in `umd/`
* `test-unit` - starts Karma to run tests

### Demo commands

* `dist-demo` - lints, cleans and builds the demo
* `lint-demo` - lints `demo/src/`
* `clean-demo` - deletes `demo/dist/`
* `build-demo` - builds the demo in `demo/src/app.js` to `demo/dist/`

## MIT Licensed
