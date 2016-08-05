import exec from '../exec'

import ora from 'ora'

export default function cleanModule(args) {
  let spinner = ora('Cleaning module').start()
  try {
    exec('rimraf', ['coverage', 'es', 'lib', 'umd'])
    spinner.succeed()
  }
  catch (err) {
    spinner.fail()
    throw err
  }
}
