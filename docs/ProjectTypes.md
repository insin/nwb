## Project Types

nwb supports creation and development of the following project types:

**React apps** - React web applications.

**React component modules** - reusable React components which will be published to npm.

The React component template includes a React demo app in `demo/src/`.

**Web apps** - web applications which don't use React.

**Web modules** - "web module" is just a shorter way of saying "a module which will be published to npm and is expected to be able to run in a browser as a dependency of a webapp"... except we just had to say that anyway,

All project templates are pre-configured to:

* have Git ignore built resources
* run their tests on [Travis CI](https://travis-ci.org/), with code coverage results posted to [codecov.io](https://codecov.io/) and [coveralls](https://coveralls.io)
* publish to npm appropriately:
  * apps have `private: true` set by default so they can't be published to npm by accident
  * components and web modules will only publish source and ES5/UMD builds to npm

Each template also comes with a working, minimal unit test to get you started.
