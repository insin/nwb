# nwb is deprecated and unmaintained

### TL;DR: use [Vite](https://vite.dev/)!

nwb was created at a time when JavaScript tooling was in flux, when the capabilities of ES6 were less widely-supported by browsers than they are today, and when versions of Webpack, Babel and other common build tools were out of date almost as soon as you added them to your package.json, and there wasn't even a create-react-app yet!

People who were adopting these tools ended up having to independently manage the same sets of dependencies and configure them to work together to create a great local development experience, a solid testing setup and optimised production builds.

The goal of nwb was to take the weight of managing these [off the shoulders of developers, and instead provide a configuration file](https://github.com/insin/react-yelp-clone/compare/master...nwb) exposing a smaller surface area for the configuration needed to tweak the things which were specific to your project.

---

At this point in time, years later than we should have formally announced nwb's deprecation, [Vite](https://vite.dev/) is one of the best implementations of that goal there is.

It's massively popular, widely-used, and it's likely that every plugin you need for your use case has already likely written, and if not, there's an API for that, which is so good that high-quality frameworks now build on top of Vite, such as [Astro](https://astro.build/) for static site generation (and on-demand server rendering) and [React Router](https://reactrouter.com) for client and/or server rendered React apps.

Web Application frameworks like [Hono](https://hono.dev/) also provide official plugins to integrate with Vite's development server if you just need to create a server which serves up a client app and provide authentication and API endpoints, while retaining Vite's fantastic developer experience.

Vite also comes with a fantastic testing framework in [Vitest](https://vitest.dev/) which integrates directly with Vite, rather than the hodge-podge of different configs we used to have to deal with to get the likes of Karma sucessfully using the same build tooling as the rest of our development process (IYKYK).

In summary:

- Starting a new React/Preact etc. project today? Possibly even your first project?

  Use [Vite](https://vite.dev/). There _will_ be a plugin and a project template for whatever you want to use.

- Have an old project which used something like nwb or create-react-app?

  Migrate to [Vite](https://vite.dev/). It's not going to be painless, but it's going to be better. I've done it. You can do it.

- Starting a new project which needs client rendering? Server rendering?

  Use [Vite](https://vite.dev/). There's a plugin or maybe even a framework built on Vite for that. Don't take on more complexity than you need. Don't fight with a framework intended for server rendering if that's not what you need.

Thanks for using nwb!

-- Jonny

---

# nwb

![Linux](resources/linux.png) [![Travis][travis-badge]][travis]
![Windows](resources/windows.png) [![Appveyor][appveyor-badge]][appveyor]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

![nwb](resources/cover.jpg)

nwb is a toolkit for:

- [Quick Development with React, Inferno, Preact or vanilla JavaScript](#quick-development)
- Developing:
  - [React Apps](#react-apps)
  - [Preact Apps](#preact-apps)
  - [Inferno Apps](#inferno-apps)
  - [Vanilla JavaScript Apps](#vanilla-javascript-apps)
  - [React Components and Libraries](#react-components-and-libraries)
  - [npm Modules for the Web](#npm-modules-for-the-web)

A zero-config development setup is provided, but nwb also supports [configuration](/docs/Configuration.md#configuration) and [plugin modules](/docs/Plugins.md#plugins) which add extra functionality (e.g. [Sass](http://sass-lang.com/) support), should you need them

## Install

Installing globally provides an `nwb` command for quick development and working with projects.

```sh
npm install -g nwb
```

> **Note:** if you're using npm 5 and getting an `EACCES: permission denied` error from nwb's PhantomJS dependency while installing globally, try passing an `--unsafe-perm` flag:
>
> `npm install -g --unsafe-perm nwb`

To use nwb's tooling in a project, install it as a `devDependency` and use `nwb` commands in `package.json` `"scripts"`:

```sh
npm install --save-dev nwb
```
```json
{
  "scripts": {
    "start": "nwb serve-react-app",
    "build": "nwb build-react-app"
  }
}
```

## Quick Development

For quick development with [React](https://facebook.github.io/react/), [Inferno](https://infernojs.org/), [Preact](https://preactjs.com/) or vanilla JavaScript, use the `nwb react`, `nwb inferno`, `nwb preact` or `nwb web` commands.

```js
import React, {Component} from 'react'

export default class App extends Component {
  render() {
    return <h1>Hello world!</h1>
  }
}
```
```sh
$ nwb react run app.js
✔ Installing react and react-dom
Starting Webpack compilation...
Compiled successfully in 5033 ms.

The app is running at http://localhost:3000/
```
```sh
$ nwb react build app.js
✔ Building React app

File size after gzip:

  dist\app.cff417a3.js  46.72 KB
```

**See [Quick Development with nwb](/docs/guides/QuickDevelopment.md#quick-development-with-nwb) for a more detailed guide.**

## React Apps

Use `nwb new react-app` to create a [React](https://facebook.github.io/react/) app skeleton, preconfigured with npm scripts which use `nwb` for development:

```sh
nwb new react-app my-app
cd my-app/
npm start
```

Open [localhost:3000](http://localhost:3000), start editing the code and changes will be hot-reloaded into the running app.

`npm test` will run the app's tests and `npm run build` will create a production build.

**See [Developing React Apps with nwb](/docs/guides/ReactApps.md#developing-react-apps-with-nwb) for a more detailed guide.**

## Preact Apps

Use `nwb new preact-app` to create a [Preact](https://preactjs.com/) app skeleton:

```sh
nwb new preact-app my-app
```

## Inferno Apps

Use `nwb new inferno-app` to create an [Inferno](https://infernojs.org/) app skeleton:

```sh
nwb new inferno-app my-app
```

## Vanilla JavaScript Apps

Use `nwb new web-app` to create a vanilla JavaScript app skeleton:

```sh
nwb new web-app my-app
```

## React Components and Libraries

```sh
nwb new react-component my-component

cd my-component/
```

`npm start` will run a demo app you can use to develop your component or library against.

`npm test` will run the project's tests and `npm run build` will create ES5, ES modules and UMD builds for publishing to npm.

**See [Developing React Components and Libraries with nwb](/docs/guides/ReactComponents.md#developing-react-components-and-libraries-with-nwb) for a more detailed guide.**

## npm Modules for the Web

```sh
nwb new web-module my-module

cd my-module/
```

`npm test` will run the project's tests and `npm run build` will create ES5, ES modules and UMD builds for publishing to npm.

## [Guides](/docs/guides/#table-of-contents)

- [Quick Development with nwb](/docs/guides/QuickDevelopment.md#quick-development-with-nwb)
- [Developing React Apps with nwb](/docs/guides/ReactApps.md#developing-react-apps-with-nwb)
- [Developing React Components and Libraries with nwb](/docs/guides/ReactComponents.md#developing-react-components-and-libraries-with-nwb)

## [Documentation](/docs/#table-of-contents)

- [Features](/docs/Features.md#features)
- [Commands](/docs/Commands.md#commands)
  - [`nwb`](/docs/Commands.md#nwb)
  - [`nwb react`, `nwb inferno`, `nwb preact` and `nwb web`](docs/guides/QuickDevelopment.md#quick-development-with-nwb)
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
- [Examples](/docs/Examples.md#examples)
- [Frequently Asked Questions](/docs/FAQ.md#frequently-asked-questions)
- [Versioning](/docs/Versioning.md#versioning)

## Why use nwb?

**Get started quickly**. Start developing from a single `.js` file or [generate a project skeleton](/docs/Commands.md#new).

**Covers the whole development cycle**. Development tools, testing and production builds for projects work out of the box, no configuration required.

**Flexible**. While everything works out of the box, you can also use an optional [configuration file](/docs/Configuration.md#configuration-file) to tweak things to your liking.

**Manages key development dependencies and configuration for you**. Check out an [example of the effect using nwb had](https://github.com/insin/react-yelp-clone/compare/master...nwb) on the amount of `devDependencies` and configuration to be managed in a real project it was dropped into.

## MIT Licensed

*Cover image created by [GeorgioWan](https://github.com/GeorgioWan)*

*Operating system icons created with [Icons8](https://icons8.com/)*

[travis-badge]: https://img.shields.io/travis/insin/nwb/master.png?style=flat-square
[travis]: https://travis-ci.org/insin/nwb

[appveyor-badge]: https://img.shields.io/appveyor/ci/insin/nwb/master.png?style=flat-square
[appveyor]: https://ci.appveyor.com/project/insin/nwb

[npm-badge]: https://img.shields.io/npm/v/nwb.png?style=flat-square
[npm]: https://www.npmjs.org/package/nwb

[coveralls-badge]: https://img.shields.io/coveralls/insin/nwb/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/insin/nwb
