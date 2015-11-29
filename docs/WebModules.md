# Web Modules

A web module is a module which will be published to npm and si expected to be able to run in a browser as a dependency of a webapp.

## Create a new web module

```
nwb new web-module <module-name>
? Which global variable will the UMD build export? <ModuleName>
```

Creates a skeleton for a web module with the given name, with a UMD build exporting the specified global variable.

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

```
nwb build
```

Builds your component and its demo app.

## Clean up

```
nwb clean
```

Deletes all builds.
