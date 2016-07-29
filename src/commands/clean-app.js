import exec from '../exec'

import ora from 'ora'

export default function cleanApp(args) {
  let dist = args._[1] || 'dist'

  let spinner = ora('Cleaning app').start()
  try {
    exec('rimraf', ['coverage', dist])
    spinner.succeed()
  }
  catch (err) {
    spinner.fail()
    throw err
  }
}
