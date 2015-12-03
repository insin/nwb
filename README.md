# nwb - npm web builder

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

npm web builder (nbw) is a development tool for [React](https://facebook.github.io/react/) apps, reusable React components and general JavaScript modules for use in webapps.

It [generates skeleton projects](/docs/Commands.md#new---create-a-new-project) and provides [development commands](/docs/Commands.md#nwb-commands) which will work with them for building, [testing](/docs/Testing.md#testing) and serving.

Rather than copying boilerplate configuration, it owns all the build tool dependencies and dynamically generates configurations suitable for each type of project.

It also aims to allows developers to layer their own configuration needs and preferences over the top of this baseline, where possible.

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
