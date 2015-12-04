## `nwb` Commands

### `new` - create a new project

```
nwb new react-app <name>
```

Creates a skeleton for a React app with the given name.

```
nwb new react-component <component-name>
? Do you want nwb to create a UMD build for this module?
? Which global variable should the UMD build export?
```

Creates a skeleton for a React component with the given name, with an optional UMD build exporting a specified global variable.

```
nwb new web-module <module-name>
? Do you want nwb to create a UMD build for this module?
? Which global variable should the UMD build export?
```

Creates a skeleton for a web module with the given name, with an optional UMD build exporting a specified global variable.

**Flags:**

* `-f` - force creation of the new project without asking any questions, using whichever default settings are necessary as a result.

### `serve` - serve a React app

```
nwb serve
```

Starts a development server which serves a React app with hot reloading.

* JavaScript and CSS changes will be applied on the fly without refreshing the page.
* Syntax errors made while the development server is running will appear as an overlay in your browser.
* Rendering errors in React components will also appear as an overlay.

**Flags:**

* `--info` - print info about Webpack modules after rebuilds
* `--port=3000` - change the port the dev server runs on

**In React apps:**

When run in a React app, `serve` will serve the app.

**In React component modules:**

When run in a React component module, `serve` will serve the component's demo app.

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

**In React apps:**

A static build will be created in `public/build/`, with `app.js` and `app.css` files plus any other resources used.

Separate `vendor.js` and `vendor.css` files will be built for any dependencies used from `node_modules`.

By default, static builds are created in production mode:

* The Babel 5 [constant-elements](https://github.com/babel/babel.github.io/blob/862b43db93e48762671267034a50c30c00e433e2/docs/advanced/transformers/optimisation/react/constant-elements.md) and [inline-elements](https://github.com/babel/babel.github.io/blob/862b43db93e48762671267034a50c30c00e433e2/docs/advanced/transformers/optimisation/react/inline-elements.md) React optimisation transforms will be used.
* code will be minified and have dead code elimination performed on it (for example, to remove development mode features from React).

To create a development build, set the `NODE_ENV` environment variable to `'development'` when running the `build` command.

nwb supports a cross-platform way of doing this, using [argv-set-env](https://github.com/kentcdodds/argv-set-env):

```
nwb build --set-env-NODE_ENV=development
```

**In React component modules and other web modules:**

Builds the component in preparation for publishing to npm.

* An ES5 build will be created in `lib/`
* If enabled, UMD builds will be created in `umd/`

If the module has a `demo/` directory, running `build` will also create a static build of its demo app in `demo/dist/`.

### `clean` - clean up

```
nwb clean
```

Deletes all built resources.
