## Introduction

nwb is a development tool for [React](https://facebook.github.io/react/) apps and components, and other web apps and npm web modules.

**Think of nwb like a frontend to [Webpack](https://webpack.github.io/), [Babel](http://babeljs.io/) and [Karma](http://karma-runner.github.io).**

It provides [commands](/docs/Commands.md#nwb-commands) for:

* creating **static builds** for React apps and other web apps, including React production optimisations
* creating **ES5 and UMD builds** for React components and other JavaScript modules to be published to npm
* **serving** React apps and demos with **hot module reloading** and **syntax/`render()` error overlays**, and other web apps with auto-reloading on change and syntax error overlays
* running **unit tests** with code coverage

Instead of copying boilerplate `devDependencies` and configuration scripts into your project, nwb **owns the npm dependencies** for these tools and **dynamically generates configuration** , so you don't have to deal with keeping these up to date yourself.

An **`nwb.config.js`** file allows you to [tweak the generated configuration](/docs/Configuration.md#configuration) to suit your project.

To speed up developing new projects, nwb can also [generate skeleton projects](/docs/Commands.md#new---create-a-new-project) which are ready for deployment or publishing out of the box, and are preconfigured for running tests on [Travis CI](https://travis-ci.org/).

### What's Configurable?

* Babel 5 settings
* Default Webpack loader settings
* Adding extra Webpack loaders (a crude escape hatch for now)
* Webpack `DefinePlugin` replacements
* Karma settings for test paths, frameworks, reporters and plugins
* CSS preprocessors can be added as [nwb plugins](/docs/Plugins.md#css-preprocessors).

See the [Configuration docs](/docs/Configuration.md#configuration) for details.

### Not Configurable... Yet

* Webpack plugins
* Source and demo directory structures - nwb currently assumes these will be exactly where its project templates put them

### Not Currently Considered

* How you actually write your React apps - React apps are all about what happens in the code; the workflow tends to be install it, import it where you need it and use it.

* Code style - linting is left in your hands, as code style is too controversial a topic to make any default choice about.

  Future versions should at least let you tell nwb how to run your linting setup at appropriate times, but it's assumed you will add your own linting calls to `package.json` scripts for now.

  If you have an ESLint config and associated dependencies you're currently copying and installing from project to project, [Duplicated Config → Tools: ESLint](https://medium.com/@jbscript/config-tools-eslint-c85b6d48f7e2#.7q5c9rloa) may be of interest.
