# nwb

![Linux](linux.png) [![Travis][travis-badge]][travis]
![Windows](windows.png) [![Appveyor][appveyor-badge]][appveyor]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

nwb is a development tool for [React](https://facebook.github.io/react/) apps and components, and plain JavaScript web apps and npm modules.

It's effectively a frontend for [Babel](http://babeljs.io/), [Webpack](https://webpack.github.io/) and [Karma](http://karma-runner.github.io), which allows you to get started with these tools without having to learn them up-front, and to use them together in a common way across your projects without copying dependencies and configuration.

----

nwb provides [development commands](/docs/Commands.md#nwb-commands) for:

* creating **static builds** for apps, including production optimisations for React apps
* creating **ES5, UMD and ES6 module builds** for React components and other npm modules
* **serving React apps** and component demos with *hot module reloading* and *syntax/`render()` error overlays*
* **serving plain JavaScript web apps** with *auto-reloading* on code changes and *syntax error overlays*
* **running unit tests** with *code coverage*

nwb **owns the dependencies** for development tools so you don't have to copy the same `devDependencies` between projects and deal with keeping them up to date yourself.

It also **dynamically generates configuration**, so you don't have to copy configuration boilerplate between projects, while an **`nwb.config.js`** file allows you to [tweak configuration](/docs/Configuration.md#configuration) to suit your project.

To speed up developing new projects, **nwb can also [generate skeleton projects](/docs/Commands.md#new---create-a-new-project)** which are ready for deployment or publishing out of the box, and are preconfigured for running unit tests on [Travis CI](https://travis-ci.org/).

## Install

Installing globally gives you an `nwb` command:

```
npm install -g nwb
```

## [Documentation](/docs/#table-of-contents)

## Example Video

Just after nwb v0.6.0 was released, someone on [Reactiflux](http://www.reactiflux.com/) asked this question:

> hey guys, i need to prove a concept quickly, i need a boilerplate with react and some kind of mobile ui framework like ratchet, does anyone know of a good boilerplate like that?

This video shows the resulting example of using nwb to create a new React project, installing [Ratchet](http://goratchet.com/) from npm and using its CSS, and [using the nwb config file to configure Babel](/docs/Configuration.md#babel-configuration) with a [plugin to make it more convenient to copy and paste HTML samples](https://github.com/insin/babel-plugin-react-html-attrs) from Ratchet's docs:

[![nwb v0.6.0 example on YouTube](https://img.youtube.com/vi/jTuyiw-xzdo/0.jpg)](https://www.youtube.com/watch?v=jTuyiw-xzdo)

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
? Do you want to create a UMD build for npm? Yes
? Which global variable should the UMD build export? ReactThing
? Do you want to create an ES6 modules build for npm? Yes
nwb: created /path/to/react-thing
nwb: installing dependencies
...
$ cd react-thing
$ nwb serve
nwb: serve-react-demo
nwb: dev server listening at http://localhost:3000
...
```

Create a new web app and start a development server which reloads on every change:

```
$ nwb new web-app secret-prototype
nwb: created /path/to/secret-prototype
$ cd secret-prototype
$ nwb serve --reload
nwb: serve-web-app
nwb: dev server listening at http://localhost:3000
...
```

Create a new web module without being asked any questions and run tests on every change as you develop it:

```
$ nwb new web-module get-form-data -f
nwb: created /path/to/get-form-data
$ cd get-form-data
$ nwb test --server
nwb: test
...
```

## Example Project

[react-nwb-github-issues](https://github.com/insin/react-nwb-github-issues) shows development of a React app from scratch using nwb.

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
  init <project-type> [name]
    initialise a project in the current directory

  new <project-type> <name>
    create a project in a new directory

  -f, --force   force project creation, don't ask questions
  -g, --global  global variable name to export in the UMD build
  --no-jsnext   disable npm ES6 modules build
  --no-umd      disable npm UMD module build

  Project types:
    react-app        a React app
    react-component  a React component module with a demo app
    web-app          a plain JavaScript app
    web-module       a plain JavaScript module

Development commands:
  build
    clean and build the project

  clean
    delete built resources

  serve
    serve an app, or a component's demo app, with hot reloading
    --fallback  serve the index page from any path
    --info      show webpack module info
    --port      port to run the dev server on (default: 3000)
    --reload    auto reload the page if hot reloading fails

  test
    run unit tests
    --coverage  create a code coverage report
    --server    keep running tests on every change
```

## MIT Licensed

*Operating system icons created with [Icons8](https://icons8.com/)*

[travis-badge]: https://img.shields.io/travis/insin/nwb/master.svg?style=flat-square
[travis]: https://travis-ci.org/insin/nwb

[appveyor-badge]: https://img.shields.io/appveyor/ci/insin/nwb/master.svg?style=flat-square
[appveyor]: https://ci.appveyor.com/project/insin/nwb

[npm-badge]: https://img.shields.io/npm/v/nwb.svg?style=flat-square
[npm]: https://www.npmjs.org/package/nwb

[coveralls-badge]: https://img.shields.io/coveralls/insin/nwb/master.svg?style=flat-square
[coveralls]: https://coveralls.io/github/insin/nwb

Don't hate me. I'm testing if appveyor will run on PRs when you specify an `only`
