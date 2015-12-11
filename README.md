# nwb - npm web builder

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

nwb is a development tool for [React](https://facebook.github.io/react/) apps, React components and other JavaScript modules.

**Think of nwb like a frontend to [Webpack](https://webpack.github.io/), [Babel](http://babeljs.io/) and [Karma](http://karma-runner.github.io).**

It provides [commands](/docs/Commands.md#nwb-commands) for:

* creating **static builds** for React apps, including production optimisations
* creating **ES5 and UMD builds** for React components and other JavaScript modules to be published to npm
* **serving** React apps and demos with **hot module reloading** and **syntax/`render()` error overlays**
* running **unit tests** with code coverage

Instead of copying boilerplate `devDependencies` and configuration scripts into your project, nwb **owns the npm dependencies** for these tools and **dynamically generates configuration** , so you don't have to deal with keeping these up to date yourself.

An **`nwb.config.js`** file allows you to [tweak the generated configuration](/docs/Configuration.md#configuration) to suit your project.

To speed up developing new projects, nwb can also [generate skeleton projects](/docs/Commands.md#new---create-a-new-project) which are ready for deployment or publishing out of the box, and are preconfigured for running tests on [Travis CI](https://travis-ci.org/).

## Install

Installing globally gives you an `nwb` command:

```
npm install -g nwb
```

## [Documentation](/docs/#table-of-contents)

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

## Example Project

[react-nwb-github-issues](https://github.com/insin/react-nwb-github-issues) shows development of a demo app from scratch using nwb.

Selected commits of interest:

* [The skeleton React app created by `nwb new react-app`](https://github.com/insin/react-nwb-github-issues/commit/b7559f598b38dc5493915cf1e5c40aaf90a082ff)
* [Installing a CSS preprocessor plugin](https://github.com/insin/react-nwb-github-issues/commit/b8e4c880ab174353dc231668e2ab48d1899ed268) - nwb automatically detects and uses CSS preprocessor plugins from your dependencies
* [Installing a dependency which manages and `require()`s its own CSS dependency](https://github.com/insin/react-nwb-github-issues/commit/cad3abd4ec47f78bf50194ec1bd7cbfb1068e733) - the CSS and its image/font dependencies were hot reloaded into the running app when this change was made

*Note: this example app is a clone of the ember-cli [github-issues-demo](https://github.com/wycats/github-issues-demo) app, and initially tries to stick close to it commit-by-commit for the sake of comparison, by using [async-props](https://github.com/rackt/async-props), which is currently in pre-release.*

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
                   --fallback  serve the index page from any path
                   --info      show webpack module info
                   --port      port to run the dev server on [3000]
```

## MIT Licensed

[build-badge]: https://img.shields.io/travis/insin/nwb/master.svg?style=flat-square
[build]: https://travis-ci.org/insin/nwb

[npm-badge]: https://img.shields.io/npm/v/nwb.svg?style=flat-square
[npm]: https://www.npmjs.org/package/nwb
