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

// Publish
exec('npm publish', process.argv.slice(2))

// Discard changes to package.json
exec('git checkout -- .')
