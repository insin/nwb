# React Apps

nwb provides a template for a React app and pre-configures development tools to work with it.

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

Runs tests once.

```
nwb test --server
```

Starts a Karma server which runs tests on every change.

## Create a static build

A static build is created in `public/build`, with an index page in `public/index.html`.

```
nwb build
```

Creates a production build - strips out development code from React, performs React element optimisations in your components and minifies code.

```
nwb build --set-env-NODE_ENV=development
```

Creates a development build.

## Clean up

```
nwb clean
```

Deletes the static build.
