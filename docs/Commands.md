## `nwb` Commands

### `new` - create a new project

```
nwb new <project-type> <name>
```

Creates a new directory and initialises a project skeleton in it.

The `name` argument must not be an existing directory.

#### Project Types

```
nwb new react-app <name>
```

Creates a skeleton for a React app with the given name.

```
nwb new react-component <component-name>
? Do you want to create a UMD build for npm? Y/n
? Which global variable should the UMD build export?
? Do you want to create an ES6 modules build for npm? Y/n
```

Creates a skeleton for a React component with the given name, with an optional UMD build exporting a specified global variable and an optional ES6 modules build for tree-shaking bundlers.

```
nwb new web-app <module-name>
```

Creates a skeleton for a web app with the given name.

```
nwb new web-module <module-name>
? Do you want to create a UMD build for npm? Y/n
? Which global variable should the UMD build export?
? Do you want to create an ES6 modules build for npm? Y/n
```

Creates a skeleton for a web module with the given name, with an optional UMD build exporting a specified global variable and an optional ES6 modules build for tree-shaking bundlers.

**Flags:**

* `-f, --force` - force creation of the new project without asking any questions, using whichever default settings are necessary as a result

**React component and web module flags:**

* `-g, --global` - provide a global variable to be exported by the UMD build, implicitly enabling the UMD build
* `--no-jsnext` - disable the npm ES6 modules build
* `--no-umd` - disable the npm UMD build

### `init` - initialise a project in the current directory

```
nwb init <project-type> [name]
```

This is the same as `new`, except the `name` argument is optional and the new project is initialised in the current directory.

If  `name` is not provided, the name of the current directory will be used.

### `serve` - serve an app

```
nwb serve
```

Starts a development server which serves an app with hot module reloading.

* JavaScript and CSS changes will be applied on the fly without refreshing the page.
* Syntax errors made while the development server is running will appear as an overlay in your browser.
* Rendering errors in React components will also appear as an overlay.

**Flags:**

* `--fallback` - fall back to serving the index page from any path, for developing React apps which use the HTML5 History API
* `--info` - print info about Webpack modules after rebuilds
* `--port=3000` - change the port the dev server runs on
* `--reload` - auto-reload the page when webpack gets stuck

**In React apps:**

When run in a `react-app` project, `serve` will serve the app with hot module reloading and display of syntax errors and React component rendering errors as overlays.

**In other web apps:**

When run in a `web-app` project, `serve` will serve the app with hot module reloading (HMR) and display of syntax errors as an overlay, *but* you will have to [manually configure your JavaScript code](https://webpack.github.io/docs/hot-module-replacement.html) if you wish to make use of HMR.

If you use the `--reload` flag, the HMR client will refresh the page any time a JavaScript change was made and it was unable to patch the module. This may be a better option if your app isn't suitable for HMR.

**In React component modules:**

When run in a `react-component` project, `serve` will serve the component's demo app with hot module reloading and display of syntax errors and React component rendering errors as overlays.

A demo app is essential to show people what your component can do - as [React Rocks](http://react.rocks/) says: online demo or it didn't happen!

Having a demo which uses your component is also a great way to test it as you prototype and build, quickly seeing what does and doesn't work before committing to a test.

### `test` - run unit tests

```
nwb test
```

Runs unit tests once.

**Flags:**

* `--server` - keep the Karma server running and keep running tests on every change. Whether you're writing tests up front or catching up after you're happy with what you've created so far, having them run on every code change makes testing more fun.
* `--coverage` - create a code coverage report in `coverage/`

**In React component modules:**

Running the test server in tandem with a hot reloading demo app, you can quickly protoype and test your components.

### `build` - create builds

```
nwb build
```

Builds the project.

**In React/web apps:**

A static build will be created in `public/build/`, with `app.js` and `app.css` files plus any other resources used.

Separate `vendor.js` and `vendor.css` files will be built for any dependencies used from `node_modules`.

By default, static builds are created in production mode. Code will be minified and have dead code elimination performed on it (for example to remove unreachable, or development-mode only, code).

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

* An ES5 build will be created in `lib/`
* If enabled, UMD builds will be created in `umd/`
* If enabled, ES6 modules builds will be created in `es6/`

If the module has a `demo/` directory, running `build` will also create a static build of its demo app in `demo/dist/`.

### `clean` - clean up

```
nwb clean
```

Deletes all built resource directories.
