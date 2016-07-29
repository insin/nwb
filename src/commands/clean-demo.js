import exec from '../exec'

import ora from 'ora'

export default function cleanModule(args) {
  let spinner = ora('Cleaning demo').start()
  try {
    exec('rimraf', ['demo/dist'])
    spinner.succeed()
  }
  catch (err) {
    spinner.fail()
    throw err
  }
}
