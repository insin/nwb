/* global echo, exec, exit, rm */
require('shelljs/global')

if (!/^3/.test(exec('npm -v', {silent: true}).stdout)) {
  echo('Releasing requires npm >= 3. Aborting.')
  exit(1)
}

if (exec('git status --porcelain', {silent: true}).stdout !== '') {
  echo('Your git status is not clean. Aborting.')
  exit(1)
}

// Force a dedupe
exec('npm dedupe')

// Avoid bundling the Mac-only fsevents when present - this is included in
// optionalDependencies instead to make sure it gets installed when needed.
if (process.platform === 'darwin') {
  rm('-rf', 'node_modules/fsevents')
}

// Copy all dependencies to bundledDependencies in package.json
exec('node node_modules/bundle-deps/bundle-deps.js')

// Publish
exec('npm publish', process.argv.slice(2))

// Discard changes to package.json
exec('git checkout -- .')
