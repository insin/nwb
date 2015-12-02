# nwb - npm web builder

Babel, Webpack and Karma in a React-shaped box.

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

Provides projects templates and preconfigured - but configurable - tooling for developing:

* React apps
* Reusable React component modules which will be published to npm
* Other web modules - modules published on npm which are expected to be able to run in a browser as a dependency of a webapp

## Install

Installing globally gives you an `nwb` command:

```
npm install -g nwb@latest
```

## [Documentation](/docs/)

## Quick Start Examples

Create a new React app and start a hot reloading development server:

```
$ nwb new react-app github-issues
nwb: created /path/to/github-issues
nwb: installing dependencies
...
$ cd github-issues
$ nwb serve
nwb: serve-react-app
nwb: dev server listening at http://localhost:3000
...
```

Create a new React component module and start hot reloading its demo app:

```
$ nwb new react-component react-thing
? Do you want nwb to create a UMD build for this module? Yes
? Which global variable should the UMD build export? ReactThing
nwb: created /path/to/react-thing
nwb: installing dependencies
...
$ cd react-thing
$ nwb serve
nwb: serve-react-demo
nwb: dev server listening at http://localhost:3000
...
```

Create a new web module and run tests on every change as you develop it:

```
$ nwb new web-module get-form-data -f
nwb: created /path/to/get-form-data
$ cd get-form-data
$ nwb test --server
nwb: test
...
```

## Usage

```
Usage: nwb <command>

Options:
  -h, --help     display this help message
  -v, --version  print nwb's version

Project creation commands:
  new react-app <name>        create a React app
  new react-component <name>  create a React component with a demo app
  new web-module <name>       create a web module
                                -f  force creation, don't ask any questions

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
