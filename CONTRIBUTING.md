## Developing

- `npm test` will lint, build and run all tests.

- `npm run test:coverage` is the same as the above, plus creation of a code coverage report.

  This is what's used for testing on Travis and Appveyor; code coverage results are posted from Travis to Coveralls after a succesful build.

- `npm run test:watch` will watch files and run all non-command tests on every change.

  This is for quick feedback while developing; command tests are not run as they're relatively slow.
