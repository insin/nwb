# Web Modules

A web module is a module published to npm which is expxected to be able to run on the browser

## Create a new web module

```
nwb new module app-name
```

## Run tests

```
nwb test
```

Starts a Karma server which runs tests on every change.

## Prepare a distribution

```
nwb dist
```

Creates an ES5 build of your module in `lib/` and a UMD build in `umd/`.
