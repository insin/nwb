## Features

- **A toolkit, not a boilerplate.**
- Uses [Webpack 4](https://webpack.js.org/), [Babel 7](https://babeljs.io/) and [Karma 5](https://karma-runner.github.io/).
- Provides tooling for [React](https://facebook.github.io/react/) apps and components, [Preact](https://preactjs.com/) apps, [Inferno](https://infernojs.org/) apps, and vanilla JS web apps and npm modules.
- Use modern JavaScript features and JSX.
- Use proposed JavaScript features now.
- Import CSS (and font resources) and images to be managed by Webpack.
- [Autoprefixed](https://github.com/postcss/autoprefixer#autoprefixer-) CSS, so you don't need to write browser prefixes; you can also configure your own [PostCSS](https://postcss.org/) plugins.
- Plugin modules which add support for the [Sass](https://github.com/insin/nwb-sass), [Less](https://github.com/insin/nwb-less) and [Stylus](https://github.com/insin/nwb-stylus) stylesheet languages.

**Development / DX:**

- Quick development commands for React, Preact and Inferno which reduce the time from idea to running code.
- Development server with Hot Module Replacement, and syntax error and React `render()` error overlays.
- User-friendly reporting of build status and errors in the CLI.
- Prompts to continue with a different port if the intended dev server port is not available.
- Express middleware for serving the same development Webpack build from your own server.
- **Experimental:** Automatically install dependencies from npm without restarting your development server by using an `--auto-install` flag.
- **Experimental:** Write destructured ES module `import`s which transpile to cherry-picked imports for specific modules to keep your bundle size down.

**Testing:**

- Run unit tests with Karma in headless Chrome, using [Mocha](https://mochajs.org/) and [Expect](https://github.com/mjackson/expect#expect1x-documentation), without any configuration.
- Flexible defaults allow tests to be organised using a number of naming schemes, with tests in a separate directory, co-located with the code, or both.
- Code coverage reporting.
- Project skeletons ready to run tests on Travis CI and post code coverage results to Coveralls/codecov.io.
- Convenient to configure your preferred testing framework and other browsers instead of the defaults, with bundled support for launching tests in Chrome.

**Production:**

- Optimised Webpack build prepares JS, CSS and images for production, with deterministic filename hashes for long-term caching, and sourcemaps for debugging.
- Production optimisations for React apps: hoisting static elements and removing `propTypes`
- Automatic creation of a separate vendor bundle.
- Flags to try a build which replaces React with Preact or Inferno via a compatibility layer, for a much smaller payload.

**Publishing:**

- Builds components and modules for publishing to npm with ES5 (including CommonJS export interop), ES modules and UMD builds.
- Project skeletons include a package.json config `files` whitelist to avoid bloating your published package.
- React component skeleton includes a demo app ready to develop and build using the same React app development setup.
- React component `propTypes` are automatically wrapped with an environment check, for elimination from production builds.

**Configuration:**

- Use a single [configuration file](https://github.com/insin/nwb/blob/master/docs/Configuration.md#configuration) to customise Babel, Webpack, Karma and npm builds if you need to.
- [Declarative config for Webpack rules and plugin settings](https://github.com/insin/nwb/blob/master/docs/Configuration.md#webpack-configuration) makes then easy to tweak.
- Convenience configuration for commonly-used features like Webpack aliases and expression replacements.
- Compatibility configuration for libraries which commonly cause Webpack issues, e.g. for bundling Moment.js with only specified locales.
