import ora from 'ora'
import path from 'path'
import {exec} from 'child_process'

import debug from './debug'
import {useYarn} from './utils'

export default function installCompatDependencies(args, cb, library) {
  const cwd = path.resolve('./')
  const pkg = require(path.resolve('./package.json'))
  const shouldInstallPreactCompat = (args.preact && (!pkg.dependencies['preact-compat'] || !pkg.dependencies['preact']))
  const shouldInstallInfernoCompat = (args.inferno && (!pkg.dependencies['inferno-compat']))
  const compat = args.preact ? 'preact preact-compat' : 'inferno-compat'
  const command = useYarn() ? `yarn add ${compat}` : `npm install --save ${compat}`

  if (shouldInstallInfernoCompat || shouldInstallPreactCompat) {
    const spinner = ora(`Install missing ${library} dependencies`).start()
    debug(`${cwd} $ ${command}`)
    exec(command, {cwd, stdio: 'inherit'}, err => {
      if (err) {
        spinner.fail()
        return cb(err)
      }
      spinner.text = `Installed missing ${library} dependencies`
      spinner.succeed()
      cb()
    })
  }
  else {
    cb()
  }
}
