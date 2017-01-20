## Features

- **A toolkit, not a boilerplate.**
- Provides specific tooling for React apps and components, Preact apps, Inferno apps, and vanilla JS web apps and npm modules.
- ES6 and JSX support.
- Use future JavaScript features like object spreading now; TC39 Stage 2 and above features are enabled by default.
- Default polyfills and configuration allow use of `Promise` (with rejection tracking enabled), `fetch`, `async`/`await`, generators and `Object.assign` in any browser.
- Import CSS (and font resources), images and JSON into your JavaScript.
- Autoprefixed CSS, so you don't need to write browser prefixes; you can also configure your own PostCSS plugins.
- Plugin modules which add [Sass](https://github.com/insin/nwb-sass), [Less](https://github.com/insin/nwb-less) and [Stylus](https://github.com/insin/nwb-stylus) support without needing configuration.

**Development / DX:**

- Quick development commands which reduce the time from idea to running code.
- Development server with Hot Module Reloading, and syntax error and React `render()` error overlays.
- User-friendly reporting of build status and errors in the CLI (based on [create-react-app](https://github.com/facebookincubator/create-react-app)'s).
- Prompts to continue with a different port if the intended dev server port is not available.
- Express middleware for serving the same development Webpack build from your own server.
- **Experimental:** Automatically install dependencies from npm without restarting your development server by using an `--auto-install` flag.
- **Experimental:** Write destructured ES6 imports which transpile to cherry-picked imports for specific modules to keep your bundle size down.

**Testing:**

- Run unit tests with Karma in PhantomJS, using Mocha and Expect, without any configuration.
- Flexible defaults allow tests to be organised using a number of naming schemes, with tests in a separate directory, co-located with the code, or both.
- Code coverage reporting.
- Project skeletons ready to run tests on Travis CI and post code coverage results to Coveralls/codecov.io.
- Convenient to configure your preferred testing framework and other browsers instead of the defaults, with bundled support for launching tests in Chrome.

**Production:**

- Optimised Webpack build prepares JS, CSS and images for production, with deterministic filename hashes for long-term caching, and sourcemaps.
- Production optimisations for React apps, including stripping of `propTypes`.
- Automatic creation of a separate vendor bundle.
- Flag to try a build which replaces React with [Preact](https://preactjs.com/) or [Inferno](https://infernojs.org/) for a much smaller payload.

**Publishing:**

- Builds components and modules for publishing to npm with ES5 (including CommonJS exports interop), ES6 modules and UMD builds.
- Project skeletons include a package.json config `files` whitelist to avoid bloating your packages.
- React component skeleton includes a demo app ready to develop and build using the same React app development setup.
- React component `propTypes` are automatically wrapped with an environment check, for elimination from production builds.

**Configuration:**

- Use a single configuration file to customise Babel, Webpack, Karma and npm builds if you need to.
- Declarative config for Webpack loader and plugin settings makes then easy to tweak.
- Convenience configuration for commonly-used features like Webpack aliases and expression replacements.
- Compatibility configuration for libraries which commonly cause Webpack issues, e.g. bundling Moment.js with only specified locales.
