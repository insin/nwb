## Commands

Installing nwb provides the following commands.

- [`react`](#react)
  - [`run`](#run) - serve a React app for quick development
  - [`build`](#build) - create a static build for a React app
- [`nwb`](#nwb)
  - [Project Creation](#project-creation)
    - [`new`](#new) - create a project skeleton in a new directory
      - [Project Types](#project-types)
    - [`init`](#init) - initialise a project skeleton in the current directory
  - [Generic Commands](#generic-commands)
    - [`serve`](#serve) - start a development server
    - [`build`](#build-1) - create a build
    - [`test`](#test) - run unit tests
  - [Project Type-specific Commands](#project-type-specific-commands)

### `react`

The `react` command provides quick React development, starting from a single `.js` file and working up.

**Options:**

- `-c, --config` - path to a config file *[default: nwb.config.js]*

The following sub-commands are available:

#### `run`

Serve a React app for quick development.

```
react run <entry> [options]
```

**Arguments:**

- `entry` - entry point for the app

**Options:**

- `--auto-install` - auto install missing npm dependencies
- `--fallback` - serve the index page from any path
- `--host` - hostname to bind the dev server to *[default: localhost]*
- `--info` - show webpack module info
- `--mount-id` - `id` for the `<div>` the app will render into *[default: app]*
- `--port` - port to run the dev server on *[default: 3000]*
- `--reload` - auto reload the page if hot reloading fails
- `--title` - contents for `<title>` *[default: React App]*

#### `build`

Create a static build for a React app.

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

The `nwb` command handles development of projects with an established directory layout and tests.

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
nwb new react-app <name>
```

Creates a skeleton for a React app with the given name.

```
nwb new web-app <module-name>
```

Creates a skeleton for a JavaScript app with the given name.

```
nwb new react-component <component-name> [options]
? Do you want to create a UMD build for npm? Y/n
? Which global variable should the UMD build export?
? Do you want to create an ES6 modules build for npm? Y/n
```

Creates a skeleton for a React component with the given name, with an optional UMD build exporting a specified global variable and an optional ES6 modules build for tree-shaking bundlers.

```
nwb new web-module <module-name> [options]
? Do you want to create a UMD build for npm? Y/n
? Which global variable should the UMD build export?
? Do you want to create an ES6 modules build for npm? Y/n
```

Creates a skeleton for a web module with the given name, with an optional UMD build exporting a specified global variable and an optional ES6 modules build for tree-shaking bundlers.

**Options:**

- `-f, --force` - force creation of the new project without asking any questions, using whichever default settings are necessary as a result

**React component and web module options:**

- `-g, --global` - provide a global variable to be exported by the UMD build, implicitly enabling the UMD build
- `--no-jsnext` - disable the npm ES6 modules build
- `--no-umd` - disable the npm UMD build

**React app/component options:**

- `--react` - set the version of react which will be installed (and set as a `peerDependency` for components). Defaults to whatever the stable version of React was when the version of `nwb` you're using was released.

##### `init`

Initialise a project skeleton in the current directory.

```
nwb init <project_type> [name]
```

This is the same as `new`, except the `name` argument is optional and the new project is initialised in the current directory.

If  `name` is not provided, the name of the current directory will be used.

#### Generic Commands

The following commands require a [configuration file](/docs/Configuration.md) to specify the appropriate `type` config so nwb knows what to do when they're run - if you always use a config file, you should only have to learn these commands regardless of which type of project you're working on.

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

- `--auto-install` - automatically install missing npm dependencies and save them to your app's `package.json`
- `--fallback` - fall back to serving the index page from any path, for developing apps which use the History API
- `--host` - change the hostname the dev server binds to *[default: localhost]*
- `--info` - print info about Webpack modules after rebuilds
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

- A static build will be created in `dist/`, with `app.js` and `app.css` files plus any other resources used.
- Separate `vendor.js` and `vendor.css` files will be built for any dependencies used from `node_modules/`.
- Static builds are created in production mode. Code will be minified and have dead code elimination performed on it (for example to remove unreachable, or development-mode only, code).

To create a development build, set the `NODE_ENV` environment variable to `'development'` when running the `build` command; nwb supports a cross-platform way of doing this, using [argv-set-env](https://github.com/kentcdodds/argv-set-env):

```
# Will work on Windows
nwb build --set-env-NODE_ENV=development

# Won't work on Windows
NODE_ENV=development nwb build
```

**In React apps only:**

In production mode builds, the Babel 5 [constant-elements](https://github.com/babel/babel.github.io/blob/862b43db93e48762671267034a50c30c00e433e2/docs/advanced/transformers/optimisation/react/constant-elements.md) and [inline-elements](https://github.com/babel/babel.github.io/blob/862b43db93e48762671267034a50c30c00e433e2/docs/advanced/transformers/optimisation/react/inline-elements.md) React optimisation transforms will be used.

**In React component modules and other web modules:**

Builds the component in preparation for publishing to npm.

Passing an argument for `entry` allows you to customise the entry point for the UMD build of your app.

- An ES5 build will be created in `lib/`
- If enabled, UMD builds will be created in `umd/`
- If enabled, ES6 modules builds will be created in `es6/`

If the module has a `demo/` directory, running `build` will also create a static build of its demo app in `demo/dist/`.

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

- `--server` - keep the Karma server running and keep running tests on every change. Whether you're writing tests up front or catching up after you're happy with what you've created so far, having them run on every code change makes testing more fun.
- `--coverage` - create a code coverage report in `coverage/`

**In React component modules:**

Running the test server in tandem with a hot reloading demo app, you can quickly protoype and test your components.

##### Project Type-specific Commands

Project-type-specific versions of the generic `build`, `clean` and `serve` commands are also available to run directly - if you use the generic commands, you will see nwb calling these for you:

- `build-demo` - build a demo app from `demo/src/index.js` to `demo/dist/`

- `build-module` - create an ES5 build for an npm module

- `build-react-app [entry] [dist_dir]` - build a react app from `entry` *[default: `src/index.js`]* to `dist_dir` *[default: `dist/`]*

- `build-umd [entry]` - create a UMD build for an npm module starting from `entry` *[default: `src/index.js`]* (this command requires configuration)

- `build-web-app [entry] [dist_dir]` - build a web app from `entry` *[default: `src/index.js`]* to `dist_dir` *[default: `dist/`]*

- `clean-app [dist_dir]` - delete `dist_dir` *[default: `dist/`]*

- `clean-demo` - delete `demo/dist/`

- `clean-module` -  delete `coverage/`, `es6/` and `lib/`

- `clean-umd` - delete `umd/`

- `serve-react-app [entry]` - serve a React app from `entry` *[default: `src/index.js`]*

- `serve-react-demo` - serve a React demo app from `demo/src/index.js`

- `serve-web-app [entry]` - serve a web app from `entry` *[default: `src/index.js`]*
