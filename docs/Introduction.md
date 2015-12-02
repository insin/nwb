## Introduction

npm web builder (nbw) provides a starter kit for developing [React](https://facebook.github.io/react/) apps, reusable React components and general JavaScript modules for use in webapps.

It generates skeleton projects and provides [development commands](/docs/Commands.md) which will work with them for building, [testing](/docs/Testing.md) and serving.

Rather than copying boilerplate configuration, it owns all the build tool dependencies and dynamically generates configurations suitable for each of these types of project, based on experience of which pieces of configuration are common, and which vary, from having developed multiple of each of them.

It also aims to allows developers to layer their own configuration needs and preferences over the top of this baseline, where possible.

### What's Configurable in 0.1?

* Babel 5 settings
* Default Webpack loader settings
* Adding extra webpack loaders - a crude escape hatch for now
* Webpack `DefinePlugin` replacements
* Karma settings for test paths, frameworks, reporters and plugins

See the [Configuration docs](/docs/Configuration.md) for details.

### Not Configurable... Yet

* Webpack plugins
* Source and demo directory structures - nwb currently assumes these will be exactly where its project templates put them

### Not Currently Considered

* How you actually write your React apps - React apps are all about what happens in the code; the workflow tends to be install it, import it where you need it and use it.

* Code style - linting is left in your hands, as code style is too controversial a topic to make any default choice about.

  Future versions should at least let you tell nwb how to run your linting setup at appropriate times, but it's assumed you will add your own linting calls to `package.json` scripts for now.

  If you currently have an ESLint config and associated dependencies you're copying and installing from project to project, [Duplicated Config → Tools: ESLint](https://medium.com/@jbscript/config-tools-eslint-c85b6d48f7e2#.7q5c9rloa) may be of interest.
