# React Apps

nwb provides a template for React apps and pre-configures development tools to work with it.

## Create a new React app

```
nwb new react-app <name>
```

Creates a skeleton for a React app with the given name.

## Start the development server

```
nwb serve
```

Starts a development server which serves up your app with hot reloading.

* JavaScript and CSS changes will be applied on the fly without refreshing the page.

* Syntax errors made while the development server is running will appear as an overlay in your browser.

* Rendering errors in React components will also appear as an overlay.

## Run tests

```
nwb test
```

Runs `-test.js`

```
nwb test --server
```

Starts a Karma server which runs tests on every change.

## Create a static build

Static builds default to production mode, which strips out development code from React, performs some React elements optimisations in your components and minifies code:

```
nwb build
```

For a development build:

```
nwb build --set-env-NODE_ENV=development
```

## Clean

Deletes the static build:

```
nwb clean
```

## `nwb.config.js`

### `type` - must be `'react-app'`



### `babel` - custom Babel configuration

### `webpack` - custom Webpack configuration
