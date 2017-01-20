## Testing

nwb uses [Karma](http://karma-runner.github.io/) as a test runner, with [Webpack](https://webpack.js.org/) to bundle test code and a [Babel plugin](https://github.com/istanbuljs/babel-plugin-istanbul/) to instrument it for code coverage reporting.

- [Default Testing Setup](#default-testing-setup)
  - [Browsers](#browsers)
  - [Test Framework and Reporter](#test-framework-and-reporter)
  - [Assertion Library](#assertion-library)
  - [Test Files](#test-files)
  - [Example Test](#example-test)
- [Importing Code in Tests](#importing-code-in-tests)
  - [Separate Test Directory](#separate-test-directory)
  - [Co-Located Tests](#co-located-tests)
- [Using a Test Context Module](#using-a-test-context-module)
  - [Automatic Babel Polyfill](#automatic-babel-polyfill)
  - [Configuring Assertion Libraries](#configuring-assertion-libraries)
  - [Global `beforeEach`/`afterEach` Hooks](#global-beforeeach--aftereach-Hooks)
- [Code Coverage](#code-coverage)
  - [Excluding Test Directories from Coverage](#excluding-test-directories-from-coverage)

### Default Testing Setup

#### Browsers

Karma runs tests in Phantom JS, which is installed automatically with nwb.

> To configure this, provide [`karma.browsers` config](/docs/Configuration.md#browsers-string--arrayplugin)

#### Test Framework and Reporter

[Mocha](https://mochajs.org/) is configured as the default test framework - its [BDD testing interface](https://mochajs.org/#bdd) is available globally in tests.

> To configure this, provide [`karma.frameworks` config](/docs/Configuration.md#frameworks-string--arrayplugin)

A suitable reporter for Mocha is configured as the default if you don't configure the test framework, otherwise the Karma `dots` reporter is used.

> To configure this, provide [`karma.reporters` config](/docs/Configuration.md#reporters-string--arrayplugin)

#### Assertion Library

[expect](https://github.com/mjackson/expect) is made available by default for assertions and spies without having to install it in your own `devDependencies` - just import it when you need it:

```
import expect from 'expect'
```

#### Test Files

In the project skeletons created by nwb's `new` and `init` commands, the sample unit test is in a `*-test.js` file in the `tests/` directory.

However, the default configuration supports having tests in any file which ends with one of the following suffixes, anywhere underneath a `src/`, `test/` or `tests/` directory:

- `-test.js`
- `.test.js`
- `.spec.js`

This supports having your tests in a separate top-level directory or [co-located with the code they're testing](https://medium.com/@kentcdodds/what-code-comments-can-teach-us-about-scaling-a-codebase-90bbfad8d70d), or both (e.g. co-located unit tests, separate integration tests).

> To configure this, provide [`karma.testFiles` config](/docs/Configuration.md#testfiles-string--arraystring)

#### Example Test

This is an example of a minimal unit test which will run with `nwb test` straight out of the box:

```js
import expect from 'expect'

describe('Minimal unit test', () => {
  it('informs the reader', () => {
    expect('tautology').toEqual('tautology')
  })
})
```

### Importing Code in Tests

Default test Webpack config is configured to alias `src` to the `src/` directory, allowing you to write tests which use directory-independent import paths, no matter where you choose to put your test files.

#### Separate Test Directory

If you're using a separate test directory, the `src` alias allows you to organise your tests whichever way you want without having to adjust how you import the code to be tested, for example if you start out with a flat structure which you later want to organise using directories as the number of tests grows, by using the alias you won't have to change how you import the code being tested.

e.g., if the following directory structure exists in your project:

```
src/
  components/
    MyComponent.js
```

Then your tests can import this component like so:

```js
import MyComponent from 'src/components/MyComponent'
```

#### Co-located Tests

If your tests are co-located with the modules they test, either as siblings or in `__tests__` directories, tests will usually move too during any reorganisation, but you may find the `src` alias useful for shared test utilities:

e.g. if you set up the following directory structure:

```js
src/
  __tests__/
    utils.js
```

Then all your co-located tests can import shared utilities like so, no matter where they are in the tree, and the utilities will be excluded from code coverage:

```js
import utils from src/__tests__/utils
```

### Using a Test Context Module

If you need to run some code before any of your tests run, the recommended approach is to create a context module for Webpack to load and use [`karma.testContext` config](/docs/Configuration.md#testcontext-string) to point to it.

You will need to use [`require.context()`](https://webpack.js.org/guides/dependency-management/#require-context) in this module to specify which test files to run, e.g.:

```js
let context = require.context('./src', true, /\.spec\.js$/)
context.keys().forEach(context)
```

**Note:** if you provide `karma.testContext` and your tests would not have been picked up by the [default test files][#test-files] config, you will also need to provide a suitable [`karma.testFiles` config](/docs/Configuration.md#testcontext-string) so your tests can be excluded from code coverage.

#### Automatic Babel Polyfill

A context module is commonly used to load polyfills to allow tests to run in browsers missing certain features, but you don't need to worry about that if you were just going to use `babel-polyfill` - nwb automatically injects Babel's polyfill into Karma tests for you.

#### Configuring Assertion Libraries

If you need to configure an assertion library before running any tests and your tests are in `.spec.js` files under `src/`, you could create the following `tests.webpack.js` module in the root of your project...

```js
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'

chai.use(chaiEnzyme())

let context = require.context('./src', true, /\.spec\.js$/)
context.keys().forEach(context)
```

...then point to it in `nwb.config.js`:

```js
module.exports = {
  karma: {
    testContext: 'tests.webpack.js'
    plugins: [
      require('karma-chai')
    ],
    frameworks: ['mocha', 'chai']
  }
}
```

#### Global `beforeEach`/`afterEach` Hooks

A Webpack context module is also a suitable place for before/after hooks which should apply to all tests.

For example, if you want to make use of Expect's spies to fail tests by default if any unexpected error logging is performed, you could use a context module like this (based on [React Router's context module](https://github.com/reactjs/react-router/blob/master/tests.webpack.js)):

```js
import expect from 'expect'

beforeEach(() => {
  expect.spyOn(console, 'error').andCall(msg => {
    let expected = false

    console.error.expected.forEach(about => {
      if (msg.indexOf(about) !== -1) {
        console.error.warned[about] = true
        expected = true
      }
    })

    if (expected) return

    console.error.threw = true
    throw new Error(msg)
  })

  console.error.expected = []
  console.error.warned = Object.create(null)
  console.error.threw = false
})

afterEach(() => {
  let {threw, expected, warned} = console.error
  console.error.restore()

  if (!threw) {
    expected.forEach(about => {
      expect(warned[about]).toExist(`Missing expected warning: ${about}`)
    })
  }
})

let context = require.context('./src', true, /-test\.js$/)
context.keys().forEach(context)
```

### Code Coverage

Passing a `--coverage` flag when running tests will generate a code coverage report in `coverage/`.

Coverage will be measured automatically when your tests are run on Travis CI, or any other environment where a `CONTINUOUS_INTEGRATION` environment variable is set to `true`.

All project skeletons come with a `.travis.yml` which will post coverage results to [codecov.io](https://codecov.io/) and [coveralls](https://coveralls.io) after a successful build.

#### Excluding Code from Coverage

> `node_modules/`, test files and test context modules are automatically excluded from code coverage.

Use [`karma.excludeFromCoverage` config](/docs/Configuration.md#excludefromcoverage-string--arraystring) to specify additional paths which should be excluded from coverage reporting.

By default, this is configured to ignore code in a few common directory conventions for test code:

```js
[
  'test/',
  'tests/',
  'src/**/__tests__/',
]
```
