# nwb - npm web builder

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

Provides templates and preconfigured tools for developing:

* React apps
* Reusable React component modules which will be published to npm
* Other web modules - modules published on npm which are expected to be able to run in a browser as a dependency of a webapp

## Install

Installing globally gives you an `nwb` command:

```
npm install -g nwb@latest
```

## [Documentation](/docs/)

## Quick starts

Create a new React app and start a hot reloading development server:

```
nwb new react-app github-issues
cd github-issues
nwb serve
```

Create a new React component module and start hot reloading its demo app:

```
nwb new react-component react-thing
? Which global variable will the UMD build export? ReactThing
cd react-thing
nwb serve
```

Create a new web module and run tests on every change as you develop it:

```
nwb new web-module get-form-data
? Which global variable will the UMD build export? getFormData
cd get-form-data
nwb test --server
```

## Usage

```
Usage: nwb <command>

Options:
  -h, --help     display this help message
  -v, --version  print nwb's version

Project creatiom commands:
  new react-app <name>        create a React app
  new react-component <name>  create a React component with a demo app
  new web-module <name>       create a web module

Development commands:
  build          clean and build
  clean          delete build
  test           run tests
                   --coverage  create code coverage report
                   --server    keep running tests on every change
  serve          serve an app, or a component's demo app, with hot reloading
                   --info      show webpack module info
                   --port      port to run the dev server on [3000]
```

## MIT Licensed

[build-badge]: https://img.shields.io/travis/insin/nwb/master.svg?style=flat-square
[build]: https://travis-ci.org/insin/nwb

[npm-badge]: https://img.shields.io/npm/v/nwb.svg?style=flat-square
[npm]: https://www.npmjs.org/package/nwb
