## Commands

Installing nwb provides the following commands:

- [`nwb`](#nwb) - project tooling
  - [Project Creation](#project-creation)
    - [`nwb new`](#nwb-new) - create a project skeleton in a new directory
      - [Project Types](#project-types)
    - [`nwb init`](#nwb-init) - initialise a project skeleton in the current directory
  - [Generic Commands](#generic-commands)
    - [`nwb serve`](#nwb-serve) - start a development server
    - [`nwb build`](#nwb-build) - create a build
    - [`nwb test`](#nwb-test) - run unit tests
  - [Project Type-specific Commands](#project-type-specific-commands)
  - [Check Config Command](#check-config-command)

- [`react`, `inferno` and `preact`](#react-inferno-and-preact) - quick development
  - See the [Quick Development with nwb](/docs/guides/QuickDevelopment.md#quick-development-with-nwb) guide

### `nwb`

The `nwb` command handles development of projects.

**Options:**

- `-c, --config` - path to a config file *[default: nwb.config.js]*

The following sub-commands are available:

#### Project Creation

These provide a workflow for getting started with a new project using the conventions nwb expects.

##### `nwb new`

Create a project skeleton in a new directory.

```
nwb new <project_type> <name>
```

The `name` argument must not be an existing directory.

###### Project Types

```
nwb new react-app <dir-name>
```

Creates a skeleton project for a React app in the specified directory.

```
nwb new preact-app <dir-name>
```

Creates a skeleton project for a Preact app in the specified directory.

```
nwb new inferno-app <dir-name>
```

Creates a skeleton project for an Inferno app in the specified directory.

```
nwb new react-component <dir-name> [options]
```

Creates a skeleton project for a React component or library, ready for publishing to npm.

```
nwb new web-app <dir-name>
```

Creates a skeleton project for a plain JavaScript app in the specified directory.

```
nwb new web-module <dir-name> [options]
```

Creates a skeleton project for a JavaScript module for use on the web, ready for publishing to npm.

**Options:**

- `-f, --force` - force creation of the new project without asking any questions, using whichever default settings are necessary as a result.

**React component and web module options:**

> Passing all available options will automatically skip asking of setup questions.

- `--es-modules` - explicitly enable or disable (with `--no-es-modules`) an ES6 modules build
- `--no-git` - disable creation of a Git repo with an initial commit
- `--umd=<var>` - enable a UMD build by providing a global variable name to be exported

**React app/component options:**

- `--react` - set the version of React which will be installed. For apps, this defaults to the latest available version. For components, this is also used as a `peerDependencies` version, defaulting to whatever the major version of React was when the version of `nwb` you're using was released.

**Preact app options:**

- `--preact` - set the version of Preact which will be installed. Defaults to the latest available version.

**Inferno app options:**

- `--inferno` - set the version of Inferno which will be installed. Defaults to the latest available version.

##### `nwb init`

Initialise a project skeleton in the current directory.

```
nwb init <project_type> [name]
```

This is the same as `new`, except the `name` argument is optional and the new project is initialised in the current directory.

If  `name` is not provided, the name of the current directory will be used.

#### npm scripts

nwb project skeletons include npm scripts which run the other nwb commands needed while developing a project for you, so you shouldn't have to manually use any of the other commands documented below.

#### Generic Commands

The following commands require a [configuration file](/docs/Configuration.md) to specify the appropriate `type` config so nwb knows what to do when they're run - if you always use a config file, you should only have to learn these commands regardless of which type of project you're working on (project skeletons include a config file by default to enable this).

##### `nwb serve`

Starts a development server which serves an app with Hot Module Replacement.

```
nwb serve [entry]
```

- JavaScript and CSS changes will be applied on the fly without refreshing the page.
- Syntax errors made while the development server is running will appear as an overlay in your browser.
- Rendering errors in React components will also appear as an overlay.

Passing an argument for `entry` allows you to customise the entry point for your React or web app.

**Options:**

- `--install` - automatically install missing npm dependencies and save them to your app's `package.json`
- `--fallback` - fall back to serving the index page from any path, for developing apps which use the History API
- `--host` - change the hostname the dev server binds to *[default: not specifying a host when starting the dev server]*
- `--port` - change the port the dev server runs on *[default: 3000]*
- `--reload` - auto-reload the page when webpack gets stuck

**In React apps:**

When run in a `react-app` project, `serve` will serve the app with hot module reloading and display of syntax errors and React component rendering errors as overlays.

**In Inferno and Preact apps:**

These apps are pre-configured to use their React compatibility layer if React is imported, so you can try to re-use existing React components out of the box.

**In other web apps:**

When run in a `web-app` project, `serve` will serve the app with Hot Module Replacement (HMR) and display of syntax errors as an overlay, *but* you will have to [manually configure your JavaScript code](https://webpack.github.io/docs/hot-module-replacement.html) if you wish to make use of HMR.

If you pass a `--reload` option, the HMR client will refresh the page any time a JavaScript change was made and it was unable to patch the module. This may be a better option if your app isn't suitable for HMR.

**In React component modules:**

When run in a `react-component` project, `serve` will serve the component's demo app with hot module reloading and display of syntax errors and React component rendering errors as overlays.

A demo app is essential to show people what your component can do - as [React Rocks](http://react.rocks/) says: online demo or it didn't happen!

Having a demo which uses your component is also a great way to test it as you prototype and build, quickly seeing what does and doesn't work before committing to a test.

##### `nwb build`

Create a build.

```
nwb build [entry] [dist_dir]
```

**In React/Infero/Preact/plain JS web apps:**

Passing arguments for `entry` and `dist_dir` allows you to customise the entry point for your app and the directory it gets build into.

Default behaviour:

- A static build will be created in `dist/`, with app `.js` and `.css` files plus any other resources used.
- Separate vendor `.js` and `.css` files will be built for any dependencies imported from `node_modules/`. You can disable this by passing a `--no-vendor` flag.
- Static builds are created in production mode. Code will be minified and have dead code elimination performed on it (for example to remove unreachable, or development-mode only, code).
- To support long-term caching, generated `.js` and `.css` filenames will contain a deterministic hash, which will only change when the contents of the files change.

To create a development build, set the `NODE_ENV` environment variable to `'development'` when running the `build` command:

```
# *nix
NODE_ENV=development nwb build

# Windows
set NODE_ENV=development&& nwb build
```

**In React apps only:**

In production mode builds, the Babel [react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types) transform will be used.

When building React apps, you can also pass a `--preact` flag to configure Webpack to use [Preact](https://preactjs.com/) via the [`preact-compat`](https://github.com/developit/preact-compat#readme) module, or an `--inferno` flag to configure Webpack to use [Inferno](https://infernojs.org/) via the [`inferno-compat`](https://github.com/infernojs/inferno/tree/master/packages/inferno-compat#readme) module.

If your app and its dependencies are compatible, this can be a quick and easy way to reduce the size of your app.

**In Inferno and Preact apps only:**

These apps are pre-configured to use their React compatibility layer if React is imported, so you can try to re-use existing React components out of the box.

You'll only pay the cost of including the compatibility layer in your bundle if you import something which uses React.

**In React component modules and other web modules:**

Builds the component in preparation for publishing to npm.

Passing an argument for `entry` allows you to customise the entry point for the UMD build of your app.

- An ES5 build will be created in `lib/`
- By default, and ES6 modules build will be created in `es/`
- If enabled, UMD builds will be created in `umd/`

If the module has a `demo/` directory, running `build` will also create a static build of its demo app in `demo/dist/`. You can disable this by passing a `--no-demo` flag. If you need to use static content in the demo app, the demo build supports use of a `demo/public/` directory.

React components created as ES6 classes or functional components will have any `propTypes` they declare wrapped an `process.env.NODE_ENV !== 'production'` check, so they will be removed by dead-code elimination in the production build of any apps they're used in. You can disable this by passing a `--no-proptypes` flag.

If you have non-JavaScript files in `src/` which you want to be copied over when building, such as CSS files, pass a `--copy-files` flag.

##### `nwb clean`

Delete built resource directories.

```
nwb clean [dist_dir]
```

For React and web apps, passing an argument for `dist_dir` allows you to customise the output directory which will be deleted.

#### Project commands

The following commands don't require an `nwb.config.js` file to specify a project type, but it may be required for other configuration depending on the command.

##### `nwb test`

Run unit tests.

```
nwb test [options]
```

**Options:**

- `--server` - keep the Karma server running and re-run tests on every change. Whether you're writing tests up front or catching up after you're happy with what you've created so far, having them run on every change makes testing more fun.
- `--coverage` - create a code coverage report in `coverage/`

**In React component modules:**

Running the test server in tandem with a hot reloading demo app, you can quickly protoype and test your components.

##### Project Type-specific Commands

Project type-specific versions of `build`, `clean` and `serve` commands are also available.

These are used in the `npm scripts` section of `package.json` in project skeletons, so the `nwb.config.js` file they include by default can be deleted if you don't need configuration.

- `build-demo` - build a React component's demo app from `demo/src/index.js` to `demo/dist/`

- `build-inferno-app [entry] [dist_dir]` - build an Inferno app from `entry` *[default: `src/index.js`]* to `dist_dir` *[default: `dist/`]*

- `build-preact-app [entry] [dist_dir]` - build a Preact app from `entry` *[default: `src/index.js`]* to `dist_dir` *[default: `dist/`]*

- `build-react-app [entry] [dist_dir]` - build a React app from `entry` *[default: `src/index.js`]* to `dist_dir` *[default: `dist/`]*

- `build-react-component [umd_entry]` - create an ES5 build, an ES6 modules build and, if configured, a UMD build - for a React component, starting from `umd_entry` *[default: `src/index.js`]* for the UMD build.

- `build-web-app [entry] [dist_dir]` - build a web app from `entry` *[default: `src/index.js`]* to `dist_dir` *[default: `dist/`]*

- `build-web-module [umd_entry]` - create an ES5 build - and if configured, an ES6 modules build and a UMD build - for a browser-focused npm module, starting from `umd_entry` *[default: `src/index.js`]* for the UMD build.

- `clean-app [dist_dir]` - delete `dist_dir` *[default: `dist/`]*

- `clean-demo` - delete `demo/dist/`

- `clean-module` -  delete `coverage/`, `es/` and `lib/`

- `serve-inferno-app [entry]` - serve an Inferno app from `entry` *[default: `src/index.js`]*

- `serve-preact-app [entry]` - serve a Preact app from `entry` *[default: `src/index.js`]*

- `serve-react-app [entry]` - serve a React app from `entry` *[default: `src/index.js`]*

- `serve-react-demo` - serve a React component's demo app from `demo/src/index.js`

- `serve-web-app [entry]` - serve a web app from `entry` *[default: `src/index.js`]*

#### Check Config Command

Checks your nwb config file for errors and deprecated usage, and provides usage hints where appropriate (e.g. if there's a more convenient way provided to set certain configuration, or if it's unnecessary)

```
nwb check-config [config] [options]
```

**Arguments:**

- `config` - path to the config file to check *[default: nwb.config.js]*

**Options:**

- `--command` - command name to use when loading your config. Use this to test variations if you [export a config function](/docs/Configuration.md#configuration-file) and use the `command` option it provides when creating your config.
- `--e, --env` - `NODE_ENV` to use when checking your config: `dev`/`development`, `test` or `prod`/`production`. Use this to test variations if you use `process.env.NODE_ENV` when creating your config.

### `react`, `inferno` and `preact`

These commands provide quick development, starting from a single `.js` file and working up.

See [Quick Development with nwb](/docs/guides/QuickDevelopment.md#quick-development-with-nwb) for details.
