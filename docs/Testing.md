## Testing

[Karma](http://karma-runner.github.io/) is used as a test runner and [Webpack](https://webpack.github.io/) is used to instrument and bundle test code.

### Default Settings

By default, tests are written in `*-test.js` files in the `tests/` directory.

[Mocha](https://mochajs.org/) is configured as the default test framework and [expect](https://github.com/mjackson/expect) is made available by default for assertions and spies without having to install it in your own `devDependencies`.

Don't worry if none of the above is to your taste, as [Karma can be configured using the nwb config file](/docs/Configuration.md#karma-object).

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
