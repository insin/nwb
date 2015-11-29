# React Components

nwb provides a template for a React component and pre-configures development tools to work with it.

The template includes a React demo app.

## Create a new React component

```
nwb new react-component <component-name>
? Which global variable will the UMD build export? <ComponentName>
```

Creates a skeleton for a React component with the given name, with a UMD build exporting the specified global variable.

## Start the development server for the demo app

```
nwb serve
```

Starts a development server which serves up your component's demo app with hot reloading.

* JavaScript and CSS changes will be applied on the fly without refreshing the page.

* Syntax errors made while the development server is running will appear as an overlay in your browser.

* Rendering errors in React components will also appear as an overlay.

## Run tests

```
nwb test
```

Runs tests once.

```
nwb test --server
```

Starts a Karma server which runs tests on every change.

## Create builds

* An ES5 build is created in `lib/`
* UMD builds are created in `umd/`
* A static build of the demo app is created in `demo/dist/`

```
nwb build
```

Builds your component and its demo app.

## Clean up

```
nwb clean
```

Deletes all builds.
