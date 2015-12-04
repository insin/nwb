## Introduction

npm web builder (nwb) is a development tool for [React](https://facebook.github.io/react/) apps, reusable React components and other JavaScript modules for use in webapps.

It provides [development commands](/docs/Commands.md#nwb-commands) for building and serving code with [Webpack](https://webpack.github.io/) and [Babel](http://babeljs.io/), and [running tests](/docs/Testing.md#testing) with [Karma](http://karma-runner.github.io).

**Think of nwb like a frontend to Webpack, Babel and Karma.**

nwb owns and manages dependencies for these tools and dynamically generates configurations for them. An `nwb.config.js` file allows you to [tweak the default configuration](/docs/Configuration.md#configuration) where it matters.

Since there is a light bit of convention involved, nwb can also [generate skeleton projects](/docs/Commands.md#new---create-a-new-project) to get you started quickly.

### What's Configurable in 0.1?

* Babel 5 settings
* Default Webpack loader settings
* Adding extra Webpack loaders - a crude escape hatch for now
* Webpack `DefinePlugin` replacements
* Karma settings for test paths, frameworks, reporters and plugins

See the [Configuration docs](/docs/Configuration.md#configuration) for details.

### Not Configurable... Yet

* Webpack plugins
* Source and demo directory structures - nwb currently assumes these will be exactly where its project templates put them

### Not Currently Considered

* How you actually write your React apps - React apps are all about what happens in the code; the workflow tends to be install it, import it where you need it and use it.

* Code style - linting is left in your hands, as code style is too controversial a topic to make any default choice about.

  Future versions should at least let you tell nwb how to run your linting setup at appropriate times, but it's assumed you will add your own linting calls to `package.json` scripts for now.

  If you currently have an ESLint config and associated dependencies you're copying and installing from project to project, [Duplicated Config → Tools: ESLint](https://medium.com/@jbscript/config-tools-eslint-c85b6d48f7e2#.7q5c9rloa) may be of interest.
