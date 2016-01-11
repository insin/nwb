## Developing

- `npm test` will lint, build and run all tests.

  This takes a few minutes to run and requires network access to install dependencies for tests which create projects.

  The last set of tests check that nwb exits correctly when running `nwb test` in a project, so you'll see output for the failure of these tests. On a successful test run, the last line will be something along the lines of `90 passing (3m)`.

- `npm run test:coverage` is the same as the above, plus creation of a code coverage report.

  This is what's used for testing on Travis and Appveyor; code coverage results are posted from Travis to Coveralls after a succesful build.

- `npm run test:watch` will watch files and run all non-command tests on every change.

  This is for quick feedback while developing; command tests are not run as they're relatively slow.
