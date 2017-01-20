## Examples

- [Example Projects](#example-projects)
  - [Thinking in React](#thinking-in-react)
  - [React Tutorial](#react-tutorial)
  - [Bootstrap 4 with Sass](#bootstrap-4-with-sass)
  - [Yelp Clone](#yelp-clone)
  - [GitHub Issues](#github-issues)
- [Other Examples](#other-examples)
  - [Kendo UI For React with nwb](#kendo-ui-for-react-with-nwb)
  - [Automatically installing dependencies from npm](#automatically-installing-dependencies-from-npm)
  - [Creating and customising a new React app](#creating-and-customising-a-new-react-app)

### Example Projects

#### Thinking in React

[nwb-thinking-in-react](https://github.com/insin/nwb-thinking-in-react) implements the example from [the Thinking in React tutorial](https://facebook.github.io/react/docs/tutorial.html) using nwb for development and testing.

#### React Tutorial

[nwb-react-tutorial](https://github.com/insin/nwb-react-tutorial) implements the chat app from [the React Tutorial](https://facebook.github.io/react/docs/tutorial.html) using [nwb's Express middleware](/docs/Middleware.md#express-4x-middleware) to develop using nwb 0.12's default configuration on the tutorial's own server.

The same server is used to serve up a Webpack development build or a production build if one exists.

#### Bootstrap 4 with Sass

- Article: [Using Bootstrap 4 from source with React and nwb](https://medium.com/@jbscript/using-bootstrap-4-from-source-with-react-and-nwb-f26caf395952)
- Repo: https://github.com/insin/bootstrap-4-nwb

#### Yelp Clone

[react-yelp-clone](https://github.com/insin/react-yelp-clone/tree/nwb) takes the app created in the [Build a Yelp Clone](https://www.fullstackreact.com/articles/react-tutorial-cloning-yelp/) React tutorial and uses nwb for its development tooling, with a custom `nwb.config.js` to support the same setup.

[Check out the diff](https://github.com/insin/react-yelp-clone/compare/master...nwb) to see the effect using nwb has on the amount of `devDependencies` and configuration which needs to be managed.

#### Github Issues

[react-nwb-github-issues](https://github.com/insin/react-nwb-github-issues) is a clone of the ember-cli [github-issues-demo](https://github.com/wycats/github-issues-demo) demo app, showing development of a React app from scratch using nwb.

Selected commits of interest:

- [The skeleton React app created by `nwb new react-app`](https://github.com/insin/react-nwb-github-issues/commit/b7559f598b38dc5493915cf1e5c40aaf90a082ff)
- [Installing a CSS preprocessor plugin](https://github.com/insin/react-nwb-github-issues/commit/b8e4c880ab174353dc231668e2ab48d1899ed268) - nwb automatically detects and uses CSS preprocessor plugins from your dependencies
- [Installing a dependency which manages and `require()`s its own CSS dependency](https://github.com/insin/react-nwb-github-issues/commit/cad3abd4ec47f78bf50194ec1bd7cbfb1068e733) - the CSS and its image/font dependencies were hot reloaded into the running app when this change was made

*Note: this example app initially tries to stick close to the original version commit-by-commit for the sake of comparison, by using [async-props](https://github.com/rackt/async-props), which is currently in pre-release.*

### Other Examples

#### Kendo UI For React with nwb

Tutorial video by [Cody Lindley](https://twitter.com/codylindley) of creating a new React app with nwb and getting started with Kendo UI components, auto-installing new dependencies from the development server and doing some Babel `stage` config via `nwb.config.js`:

[![Kendo UI For React with nwb on YouTube](https://img.youtube.com/vi/n-1eSuDQsbg/0.jpg)](https://www.youtube.com/watch?v=n-1eSuDQsbg)

Good tip from this video: use `--` to pass additional flags to `npm run` commands: `npm start -- --auto-install`.

#### Automatically installing dependencies from npm

nwb v0.7 added an `--auto-install` flag to `nwb serve` which automatically installs and saves missing dependencies from npm using [`NpmInstallPlugin`](https://github.com/ericclemmons/npm-install-webpack-plugin).

![nwb serve --auto-install example](/resources/auto-install.gif)

#### Creating and customising a new React app

Just after nwb v0.6 was released, someone on [Reactiflux](http://www.reactiflux.com/) asked this question:

> hey guys, i need to prove a concept quickly, i need a boilerplate with react and some kind of mobile ui framework like ratchet, does anyone know of a good boilerplate like that?

This video shows the resulting example of using nwb to create a new React app project, installing [Ratchet](http://goratchet.com/) from npm and using its CSS, and [using the nwb config file to configure Babel](/docs/Configuration.md#babel-configuration) with a [plugin to make it more convenient to copy and paste HTML samples](https://github.com/insin/babel-plugin-react-html-attrs) from Ratchet's docs:

[![nwb v0.6.0 example on YouTube](https://img.youtube.com/vi/jTuyiw-xzdo/0.jpg)](https://www.youtube.com/watch?v=jTuyiw-xzdo)
