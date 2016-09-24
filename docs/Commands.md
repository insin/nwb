## Commands

Installing nwb provides the following commands.

- [`react`](#react) - quick React development
  - [`run`](#run) - serve a React app or component module
  - [`build`](#build) - create a static build for a React app
- [`nwb`](#nwb) - project tooling
  - [Project Creation](#project-creation)
    - [`new`](#new) - create a project skeleton in a new directory
      - [Project Types](#project-types)
    - [`init`](#init) - initialise a project skeleton in the current directory
  - [Generic Commands](#generic-commands)
    - [`serve`](#serve) - start a development server
    - [`build`](#build-1) - create a build
    - [`test`](#test) - run unit tests
  - [Project Type-specific Commands](#project-type-specific-commands)
  - [Check Config Command](#check-config-command)

### `react`

The `react` command provides quick React development, starting from a single `.js` file and working up.

**Options:**

- `-c, --config` - path to a config file; a config file is only required if you specify one, but an `nwb.config.js` file in the current directory will be used if present *[default: nwb.config.js]*

The following sub-commands are available:

#### `run`

Serve a React app for quick development.

Also supports serving modules which export a React component or element.

```
react run <entry> [options]
```

**Arguments:**

- `entry` - entry point for the app, or a module which exports a React component or element.

**Options:**

- `--install` - auto install missing npm dependencies
- `--host` - hostname to bind the dev server to *[default: not specifying a host when starting the dev server]*
- `--mount-id` - `id` for the `<div>` the app will render into *[ app]*
- `--no-fallback` - disable serving of the index page from any path
- `--port` - port to run the dev server on *[default: 3000]*
- `--reload` - auto reload the page if hot reloading fails
- `--title` - contents for `<title>` *[default: React App]*

#### `build`

Create a production build for a React app.

```
react build <entry> [dist_dir] [options]
```

**Arguments:**

- `entry` - entry point for the app
- `dist_dir` - build output directory *[default: dist/]*

**Options:**

- `--mount-id` - `id` for the `<div>` the app will render into *[default: app]*
- `--title` - contents for `<title>` *[default: React App]*
- `--preact` - create a [preact-compat](https://github.com/developit/preact-compat#usage-with-webpack)-compatible build
- `--vendor` - create a separate vendor bundle

### `nwb`

The `nwb` command handles development of projects.

**Options:**

- `-c, --config` - path to a config file *[default: nwb.config.js]*

The following sub-commands are available:

#### Project Creation

These provide a workflow for getting started with a new project using the conventions nwb expects.

##### `new`

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
nwb new react-component <dir-name> [options]
```

Creates a skeleton project for a React component or library, which will be published to npm.

```
nwb new web-app <dir-name>
```

Creates a skeleton project for a plain JavaScript app in the specified directory.

```
nwb new web-module <dir-name> [options]
```

Creates a skeleton project for an npm web module.

**Options:**

- `-f, --force` - force creation of the new project without asking any questions, using whichever default settings are necessary as a result.

**React component and web module options:**

> Passing all available options will automatically skip asking of setup questions.

- `--es-modules` - explicitly enable or disable (with `--no-es-modules`) an ES6 modules build
- `--no-git` - disable creation of a Git repo with an initial commit
- `--umd=<var>` - enable a UMD build by providing a global variable name to be exported

**React app/component options:**

- `--react` - set the version of react which will be installed (and set as a `peerDependency` for components). Defaults to whatever the stable version of React was when the version of `nwb` you're using was released.

##### `init`

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

##### `serve`

Starts a development server which serves an app with hot module reloading.

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

**In other web apps:**

When run in a `web-app` project, `serve` will serve the app with hot module reloading (HMR) and display of syntax errors as an overlay, *but* you will have to [manually configure your JavaScript code](https://webpack.github.io/docs/hot-module-replacement.html) if you wish to make use of HMR.

If you pass a `--reload` option, the HMR client will refresh the page any time a JavaScript change was made and it was unable to patch the module. This may be a better option if your app isn't suitable for HMR.

**In React component modules:**

When run in a `react-component` project, `serve` will serve the component's demo app with hot module reloading and display of syntax errors and React component rendering errors as overlays.

A demo app is essential to show people what your component can do - as [React Rocks](http://react.rocks/) says: online demo or it didn't happen!

Having a demo which uses your component is also a great way to test it as you prototype and build, quickly seeing what does and doesn't work before committing to a test.

##### `build`

Create a build.

```
nwb build [entry] [dist_dir]
```

**In React/web apps:**

Passing arguments for `entry` and `dist_dir` allows you to customise the entry point for your app and the directory it gets build into.

Default behaviour:

- A static build will be created in `dist/`, with app `.js` and `.css` files plus any other resources used.
- Separate vendor `.js` and `.css` files will be built for any dependencies imported from `node_modules/`. You can disable this by passing a `--no-vendor` flag.
- Static builds are created in production mode. Code will be minified and have dead code elimination performed on it (for example to remove unreachable, or development-mode only, code).
- To support long-term caching, generated `.js` and `.css` filenames will contain a deterministic hash, which will only change when the contents of the files change.

To create a development build, set the `NODE_ENV` environment variable to `'development'` when running the `build` command; nwb supports a cross-platform way of doing this, using [argv-set-env](https://github.com/kentcdodds/argv-set-env):

```
# Will work on Windows
nwb build --set-env-NODE_ENV=development

# Won't work on Windows
NODE_ENV=development nwb build
```

**In React apps only:**

In production mode builds, the Babel [react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types) transform will be used.

When building React apps, you can also pass a `--preact` flag to configure Webpack to use [Preact](https://github.com/developit/preact) via the [`preact-compat`](https://github.com/developit/preact-compat) module (both of which must be installed separately). If your app and its dependencies are  compatible with Preact, this can be a quick and easy way to reduce the size of your app.

**In React component modules and other web modules:**

Builds the component in preparation for publishing to npm.

Passing an argument for `entry` allows you to customise the entry point for the UMD build of your app.

- An ES5 build will be created in `lib/`
- By default, and ES6 modules build will be created in `es/`
- If enabled, UMD builds will be created in `umd/`

If the module has a `demo/` directory, running `build` will also create a static build of its demo app in `demo/dist/`. You can disable this by passing a `--no-demo` flag.

React components created as ES6 classes or functional components will have any `propTypes` they declare wrapped an `process.env.NODE_ENV !== 'production'` check, so they will be removed by dead-code elimination in the production build of any apps they're used in. You can disable this by passing a `--no-proptypes` flag.

##### `clean`

Delete built resource directories.

```
nwb clean [dist_dir]
```

For React and web apps, passing an argument for `dist_dir` allows you to customise the output directory which will be deleted.

#### Project commands

The following commands don't require an `nwb.config.js` file to specify a project type, but it may be required for other configuration depending on the command.

##### `test`

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

- `build-demo` - build a demo React app from `demo/src/index.js` to `demo/dist/`

- `build-react-app [entry] [dist_dir]` - build a react app from `entry` *[default: `src/index.js`]* to `dist_dir` *[default: `dist/`]*

- `build-react-component [umd_entry]` - create an ES5 build, an ES6 modules build and, if configured, a UMD build - for a React component, starting from `umd_entry` *[default: `src/index.js`]* for the UMD build.

- `build-web-app [entry] [dist_dir]` - build a web app from `entry` *[default: `src/index.js`]* to `dist_dir` *[default: `dist/`]*

- `build-web-module [umd_entry]` - create an ES5 build - and if configured, an ES6 modules build and a UMD build - for a browser-focused npm module, starting from `umd_entry` *[default: `src/index.js`]* for the UMD build.

- `clean-app [dist_dir]` - delete `dist_dir` *[default: `dist/`]*

- `clean-demo` - delete `demo/dist/`

- `clean-module` -  delete `coverage/`, `es/` and `lib/`

- `serve-react-app [entry]` - serve a React app from `entry` *[default: `src/index.js`]*

- `serve-react-demo` - serve a React demo app from `demo/src/index.js`

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
