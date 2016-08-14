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

## Install

Installing globally provides `react` and `nwb` commands for quick React development and generating project skeletons preconfigured for development using nwb:

```
npm install -g nwb
```

Installing into a project provides an `nwb` command for use in `package.json` `scripts`:

```
npm install --save-dev nwb
```


Open [http://localhost:3000](http://localhost:3000), start editing the code and changes will be hot-reloaded into the running app.

`npm test` will run the app's tests and `npm run build` will create a production build.

---

nwb handles dependencies and configuration for [Babel](http://babeljs.io/), [Webpack](https://webpack.github.io/) and [Karma](http://karma-runner.github.io) so you can start writing code straight away.

## Install



```
npm install -g nwb
```

Install nwb into an existing project's `devDependencies` to use `nwb` commands in its `package.json` `"scripts"`:

```
npm install --save-dev nwb
```

## [Guides](/docs/guides/#table-of-contents)

- [Developing React Apps with nwb](/docs/guides/ReactApps.md)
- [Developing React Components and Libraries with nwb](/docs/guides/ReactComponents.md)

## [Documentation](/docs/#table-of-contents)

- [Commands](/docs/Commands.md#commands)
  - [`react`](/docs/Commands.md#react)
  - [`nwb`](/docs/Commands.md#nwb)
- [Configuration](/docs/Configuration.md#configuration)
  - [Configuration File](/docs/Configuration.md#configuration-file)
  - [Configuration Object](/docs/Configuration.md#configuration-object)
    - [Babel Configuration](/docs/Configuration.md#babel-configuration)
    - [Webpack Configuration](/docs/Configuration.md#webpack-configuration)
    - [Karma Configuration](/docs/Configuration.md#karma-configuration)
    - [npm Build Configuration](/docs/Configuration.md#npm-build-configuration)
- [Testing](/docs/Testing.md#testing)
- [Plugins](/docs/Plugins.md#plugins)
- [Middleware](/docs/Middleware.md#middleware)
- [Projects](/docs/Projects.md#projects)
- [Examples](/docs/Examples.md#examples)

## Why use nwb?

**Gets you started quickly**. Start developing a React app from a single `.js` file or [generate a starter project](/docs/Commands.md#new).

**Covers the whole development cycle**. Development tools, testing and production builds for projects work out of the box, no configuration required.

**Manages key development dependencies and configuration for you**. Check out an [example of the effect using nwb has](https://github.com/insin/react-yelp-clone/compare/master...nwb) on the amount of `devDependencies` and configuration to be managed in a real project it was dropped into.

**Flexible**. While everything works out of the box, you can also use an optional [configuration file](/docs/Configuration.md#configuration-file) to tweak things to your liking.

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
