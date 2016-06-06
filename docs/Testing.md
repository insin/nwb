## Testing

[Karma](http://karma-runner.github.io/) is used as a test runner and [Webpack](https://webpack.github.io/) is used to instrument and bundle test code.

- [Default Settings](#default-settings)
  - [Example Test](#example-test)
- [Importing Code to be Tested](#importing-code-to-be-tested)
- [Using a Test Context Module](#using-a-test-context-module)
- [Code Coverage](#code-coverage)

### Default Settings

By default, tests are written in `*-test.js` files in the `tests/` directory.

[Mocha](https://mochajs.org/) is configured as the default test framework and [expect](https://github.com/mjackson/expect) is made available by default for assertions and spies without having to install it in your own `devDependencies`.

Don't worry if none of the above is to your taste, as [Karma can be configured using the nwb config file](/docs/Configuration.md#karma-object).

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

### Importing Code to be Tested

Default test Webpack config is configured to alias `'src'` to the `src/` directory, allowing you to perform top-level imports for the code to be tested, instead of having to use `'../'` paths to climb out of the `tests/` dir.

This allows you to organise your code under `tests/` whichever way you want without having to adjust how you import the code to be tested.

For example, if the following directory structure exists in your project:

```
src/
  components/
    Finagler.js
```

Then your tests can import this component like so:

```js
import Finagler from 'src/components/Finagler'
```

### Using a Test Context Module

If you need to run some code before any of your tests run, the recommended way is to create a context module for Webpack to load and use [`karma.tests` config](/docs/Configuration.md#tests-string) to point to it. You will need to use use [`require.context()`](https://webpack.github.io/docs/context.html#require-context) in this module to specify which test files to run.

For example, if you need to configure an assertion library before running any tests and your tests are in `.spec.js` files under `src/`, you could create the following `tests.webpack.js` module in the root of your project...

```js
var chai = require('chai')
var chaiEnzyme = require('chai-enzyme')

chai.use(chaiEnzyme())

var context = require.context('./src', true, /\.spec\.js$/)
context.keys().forEach(context)
```

...then point to it in `nwb.config.js`:

```js
module.exports = {
  karma: {
    tests: 'tests.webpack.js'
    plugins: [
      require('karma-chai')
    ],
    frameworks: ['mocha', 'chai']
  }
}
```

#### Babel Polyfill

A context module is also commonly used to load polyfills, but you don't need to worry about that - nwb handles injecting Babel's polyfills into Karma tests for you.

### Code Coverage

Passing a `--coverage` flag when running tests will generate a code coverage report in `coverage/`.

Coverage will be measured automatically when your tests are run on Travis CI, or any other environment where a `CONTINUOUS_INTEGRATION` environment variable is set to `true`.

All project templates come with a `.travis.yml` which will post coverage results to [codecov.io](https://codecov.io/) and [coveralls](https://coveralls.io) after a successful build.
