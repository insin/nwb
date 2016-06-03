## Introduction

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

### What's Configurable?

* Babel 5 settings
* Webpack settings
  * Default sets of loaders and plugins are provided and made configurable
  * Additional CSS preprocessors can be added as [nwb plugins](/docs/Plugins.md#css-preprocessors)
  * Extra config can be merged into the generated Webpack config
* Karma settings
  * A default testing setup is provided
  * Additional plugins, frameworks and reporters can be configured
  * Extra config can be merged into the generated Webpack config
* Project layout
  * Entry point for apps and UMD builds (default: `src/index.js`)
  * Directory apps are built to (default: `dist/`)
  * HTML template for apps (default: `src/index.html`), falling back to a basic default template if none is provided.

See the [Configuration docs](/docs/Configuration.md#configuration) for details.

### Not Configurable... Yet

* Project layout
  * Source is assumed to be under `src/`
  * Static resources for apps are assumed to be in `public/`
  * The entry point for React component demo apps is assumed to be `demo/src/index.js`, with built resources in `demo/dist/`

### Not Currently Considered

* How you actually write your React apps - React apps are all about what happens in the code; the workflow tends to be install it, import it where you need it and use it.

### Not Considered

* Code style - linting is left in your hands, as code style is too controversial a topic to make any default choice about.

  Future versions should at least let you tell nwb how to run your linting setup at appropriate times, but it's assumed you will add your own linting calls to your project's `package.json` scripts for now.

  If you have an ESLint config and associated dependencies you're currently copying and installing from project to project, [Duplicated Config → Tools: ESLint](https://medium.com/@jbscript/config-tools-eslint-c85b6d48f7e2#.7q5c9rloa) may be of interest as an example of how to alleviate this.
