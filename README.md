# nwb

![Linux](/resources/linux.png) [![Travis][travis-badge]][travis]
![Windows](/resources/windows.png) [![Appveyor][appveyor-badge]][appveyor]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

nwb is a development tool for [React](https://facebook.github.io/react/) apps, React components and other browser-focused npm modules.

---

It provides commands for using [Babel](http://babeljs.io/), [Webpack](https://webpack.github.io/) and [Karma](http://karma-runner.github.io) together so you can get started developing quickly and reduce the amount of `devDependencies` and configuration boilerplate in your projects:

- [`react`](/docs/Commands.md#react) is for quick development of React apps, starting from a single `.js` file and building up:
  - `react run app.js` starts a development server.
  - `react build app.js` creates a static build.

- [`nwb`](/docs/Commands.md#nwb) is for common development tasks in a project's `package.json` `scripts`:
  - `nwb start` starts a development server.
  - `nwb test` runs unit tests.
  - `nwb build` creates a static build.
  - `nwb new` creates skeleton projects.

---

**Table of Contents**

- [Install](#install)
- [Why?](#why-)
- [Quick Start Examples](#quick-start-examples)
- [Documentation](/docs/#table-of-contents)
- [Usage](#usage)
  - [Quick React Development](#quick-react-development)
  - [Projects](#projects)
- [Versioning](#versioning)

## Install

Installing globally provides `react` and `nwb` commands for quick React development and generating project skeletons preconfigured for development using nwb:

```
npm install -g nwb
```

Installing into a project provides an `nwb` command for use in `package.json` `scripts`:

```
npm install --save-dev nwb
```

## Why?

nwb **gets you started quickly** with workflows for starting from a single `.js` file and building up, or [generating skeleton projects](/docs/Commands.md#new) ready for deployment or publishing out of the box, preconfigured for running unit tests on [Travis CI](https://travis-ci.org/).

nwb **owns core development dependencies** so you don't have to copy the same `devDependencies` between projects and deal with keeping them up to date individually.

nwb **dynamically generates configuration**, so you don't have to copy configuration boilerplate between projects. It generates a baseline default configuration and allows you to [use a single configuration file to tweak or add to the default configuration](/docs/Configuration.md#configuration-file) to suit your project.

## Quick Start Examples

*(Assuming a global install of nwb)*

Start developing a React app from a single file, automatically installing missing dependencies from npm when they're required; then create a static build for distribution:

```
$ touch app.js
...
$ react run app.js --auto-install
nwb: serve-react
nwb: dev server listening at http://localhost:3000
...
$ react build app.js
nwb: clean-app
nwb: build-react
...
```

Create a new React app project and start a development server:

```
$ nwb new react-app github-issues
...
nwb: installing dependencies
...
$ cd github-issues
$ npm start
nwb: serve-react-app
nwb: dev server listening at http://localhost:3000
...
```

Create a new React component project and start a development server for its demo app:

```
$ nwb new react-component react-thing
? Do you want to create a UMD build for npm? Yes
? Which global variable should the UMD build export? ReactThing
? Do you want to create an ES6 modules build for npm? Yes
...
nwb: installing dependencies
...
$ cd react-thing
$ npm start
nwb: serve-react-demo
nwb: dev server listening at http://localhost:3000
...
```

## [Documentation](/docs/#table-of-contents)

## Usage

### Quick React Development

The `react` command provides quick React development, starting from a single `.js` file and working up.

```
Usage: react (run|build) [options]

Options:
  -c, --config   config file to use [default: nwb.config.js]
  -h, --help     display this help message
  -v, --version  print nwb's version

Commands:
  react run <entry> [options]
    Serve a React app for development.

    Arguments:
      entry           entry point for the app

    Options:
      --auto-install  auto install missing npm dependencies
      --fallback      serve the index page from any path
      --host          hostname to bind the dev server to [default: localhost]
      --info          show webpack module info
      --mount-id      id for the <div> the app will render into [default: app]
      --port          port to run the dev server on [default: 3000]
      --reload        auto reload the page if hot reloading fails
      --title         contents for <title> [default: React App]

  react build <entry> [dist_dir] [options]
    Create a static build for a React app.

    Arguments:
      entry       entry point for the app
      dist_dir    build output directory [default: dist/]

    Options:
      --mount-id  id for the <div> the app will render into [default: app]
      --title     contents for <title> [default: React App]
      --vendor    create a separate vendor bundle
```

### Projects

The `nwb` command handles development tasks for different types of projects.

```
Usage: nwb <command>

Options:
  -c, --config   config file to use [default: nwb.config.js]
  -h, --help     display this help message
  -v, --version  print nwb's version

Project creation commands:
  nwb new <project_type> <name> [options]
    Create a project in a new directory.

    Arguments:
      project_type  project type - see the list below
      name          project name

  Options:
    -f, --force   force project creation, don't ask questions
    -g, --global  global variable name to export in the UMD build
    --no-jsnext   disable npm ES6 modules build
    --no-umd      disable npm UMD module build
    --react       version of React to install for React apps & components

  nwb init <project_type> [name] [options]
    Initialise a project in the current directory.

    Arguments:
      project_type  project type - see the list below
      name          project name [default: working directory name]

  Project types:
    react-app        a React app
    react-component  a React component module with a demo app
    web-app          a plain JavaScript app
    web-module       a plain JavaScript module

Generic development commands:
  Arguments for these commands depend on the type of project they're being run
  in. See the applicable project type-specific commands below.

  nwb build
    Clean and build the project.

  nwb clean
    Delete built resources.

  nwb serve
    Serve an app, or a component's demo app, with hot reloading.

    Options:
      --auto-install  auto install missing npm dependencies
      --fallback      serve the index page from any path
      --host          hostname to bind the dev server to [default: localhost]
      --info          show webpack module info
      --port          port to run the dev server on [default: 3000]
      --reload        auto reload the page if hot reloading fails

  nwb test
    Run unit tests.

    Options:
      --coverage  create a code coverage report
      --server    keep running tests on every change

Project type-specific commands:
  nwb build-demo
    Build a demo app from demo/src/index.js to demo/dist/.

  nwb build-module
    Create an ES5 build for an npm module (ES6 modules build requires config).

  nwb build-react-app [entry] [dist_dir]
    Build a React app from entry to dist_dir.

  nwb build-umd [entry]
    Create a UMD build for an npm module from entry (requires config).

  nwb build-web-app [entry] [dist_dir]
    Build a web app from entry to dist_dir.

  nwb clean-app [dist_dir]
    Delete dist_dir.

  nwb clean-demo
    Delete demo/dist/.

  nwb clean-module
    Delete coverage/, es6/ and lib/.

  nwb clean-umd
    Delete umd/.

  nwb serve-react-app [entry]
    Serve a React app from entry

  nwb serve-react-demo
    Serve a React demo app from demo/src/index.js.

  nwb serve-web-app [entry]
    Serve a web app from entry.

  Arguments:
    entry     entry point [default: src/index.js]
    dist_dir  build output directory [default: dist/]
```

## Versioning

Since [Semantic Versioning v2.0.0](http://semver.org/spec/v2.0.0.html) specifies...

> Major version zero (`0.y.z`) is for initial development. Anything may change at any time. The public API should not be considered stable.

...you can *technically* follow both SemVer and [Sentimental Versioning](http://sentimentalversioning.org/) at the same time.

This is what versions mean during nwb's initial development:

- `0.y` versions are majorish, anything may change - **always read the [CHANGES](/CHANGES.md) file or [GitHub release notes](https://github.com/insin/nwb/releases) to review what's changed before upgrading**.

  *Where possible*, any changes required to the nwb config file format will be backwards-compatible in the `0.y` version they're introduced in, with a deprecation warning when the old format is used. Support for the old format will then be dropped in the next `0.y` release.

- `0.y.z` versions are minorish, and may contain bug fixes, non-breaking changes, minor new features and non-breaking dependency changes.

  I will be pinning my own projects' nwb version range against these - e.g. `"nwb": "0.7.x"` - but **[if in doubt](https://medium.com/@kentcdodds/why-semver-ranges-are-literally-the-worst-817cdcb09277), pin your dependencies against an exact version**.

> Version 1.0.0 defines the public API. The way in which the version number is incremented after this release is dependent on this public API and how it changes.

## MIT Licensed

*Operating system icons created with [Icons8](https://icons8.com/)*

[travis-badge]: https://img.shields.io/travis/insin/nwb/master.png?style=flat-square
[travis]: https://travis-ci.org/insin/nwb

[appveyor-badge]: https://img.shields.io/appveyor/ci/insin/nwb/master.png?style=flat-square
[appveyor]: https://ci.appveyor.com/project/insin/nwb

[npm-badge]: https://img.shields.io/npm/v/nwb.png?style=flat-square
[npm]: https://www.npmjs.org/package/nwb

[coveralls-badge]: https://img.shields.io/coveralls/insin/nwb/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/insin/nwb
