# nwb - npm web builder

[![npm package][npm-badge]][npm]

Provides templates and preconfigured tools for developing:

* React apps
* React components
* web modules - modules published on npm which are expected to be able to run in a browser as a dependency of a webapp.

## Install

Installing globally gives you an `nwb` command:

```
npm install -g nwb
```

## Getting started

Create a new React app and start a hot reloading development server:

```
nwb new react-app github-issues
cd github-issues
nwb serve
```

Create a new React component and start hot reloading its demo app:

```
nwb new react-component react-thing
? Which global variable will the UMD build export? ReactThing
cd react-thing
nwb serve
```

Create a new web module and run tests on every change as you develop it:

```
nwb new web-module get-form-data
cd get-form-data
nwb test --server
```

## Usage

```
Usage: nwb <command>

Options:
  -h, --help     display this help message
  -v, --version  print nwb's version

Module creation commands:
  new react-app <name>        create a React app
  new react-component <name>  create a React component with a demo app
  new web-module <name>       create a web module

Common commands:
  build          clean and build
  clean          delete build
  test           run tests
                   --coverage  create code coverage report
                   --server    keep running tests on every change

React module commands:
  serve          serve an app, or a component's demo app, with hot reloading
                   --info  show webpack build info
                   --port  port to run the dev server on [3000]
```

## Documentation

### Supported module types

* [React Apps](/docs/ReactApps.md)
* [React Components](/docs/ReactComponents.md)
* [Web Modules](/docs/WebModules.md)

All module templates are also configured:

* To run their tests on [Travis CI](https://travis-ci.org/)
  * with code coverage results posted to [codecov.io](https://codecov.io/)
* To be published to npm with only the required files.

### Configuration

nwb uses an `nwb.config.js` file in the project root and some standard fields from `package.json` for configuration:

* [Configuration](/docs/Configuration.md)

## MIT Licensed

[npm-badge]: https://img.shields.io/npm/v/nwb.svg
[npm]: https://www.npmjs.org/package/nwb
