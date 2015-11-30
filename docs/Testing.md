## Testing

Tests are written in `*-test.js` files in the `tests/` directory.

[Karma](http://karma-runner.github.io/) is used as a test runner and [Webpack](https://webpack.github.io/) is used to instrument and bundle test code.

**nwb 0.1 assumes use of the [Mocha](https://mochajs.org/) test framework and configures Karma for it.** This should be configurable in a future release, but for now, Mocha test functions will be available globally in tests.

You're free to use whichever assertion library - and other unit testing utilities, such as spies - you like, but for the sake of providing a default so you don't *have* to start by making a decision, nwb 0.1 manages a dependency for the [Expect](https://github.com/mjackson/expect) library for assertions and spies. As a result, you can import Expect without having it in your own `devDependencies`.

### Example Test

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

Webpack is configured to alias `'src'` to the `src/` directory, allowing you to perform top-level imports for the code to be tested, instead of having to use `'../'` paths to climb out of the `tests/` dir.

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

### Coverage

Passing a `--coverage` flag when running tests will generate a code coverage report in `coverage/`.

Coverage will be measured automatically when your tests are run on Travis CI.

All project templates come with a `.travis.yml` which will post coverage results to [codecov.io](https://codecov.io/) and [coveralls](https://coveralls.io) after a successful build.
