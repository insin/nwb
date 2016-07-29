import {green, red, yellow} from 'chalk'

import {clearConsole} from './utils'

const friendlySyntaxErrorLabel = 'Syntax error:'

function formatMessage(message) {
  return message
    // Make some common errors shorter:
    .replace(
      // Babel syntax error
      'Module build failed: SyntaxError:',
      friendlySyntaxErrorLabel
    )
    .replace(
      // Webpack file not found error
      /Module not found: Error: Cannot resolve 'file' or 'directory'/,
      'Module not found:'
    )
    // Internal stacks are generally useless so we strip them
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '') // at ... ...:x:y
    // Webpack loader names obscure CSS filenames
    .replace(/\.\/~\/css-loader!(\.\/~\/\w+-loader!)*/, '')
}

function isLikelyASyntaxError(message) {
  return message.indexOf(friendlySyntaxErrorLabel) !== -1
}

export default class WebpackDXPlugin {
  constructor({url}) {
    this.url = url

    this.done = this.done.bind(this)
    this.invalid = this.invalid.bind(this)
  }

  apply(compiler) {
    compiler.plugin('done', this.done)
    compiler.plugin('invalid', this.invalid)
  }

  done(stats) {
    clearConsole()
    let hasErrors = stats.hasErrors()
    let hasWarnings = stats.hasWarnings()
    if (!hasErrors && !hasWarnings) {
      console.log(green('Compiled successfully!'))
      console.log()
      console.log(`The app is running at ${this.url}`)
      console.log()
      return
    }

    let json = stats.toJson()
    let formattedErrors = json.errors.map(message =>
      `Error in ${formatMessage(message)}`
    )
    let formattedWarnings = json.warnings.map(message =>
      `Warning in ${formatMessage(message)}`
    )

    if (hasErrors) {
      console.log(red('Failed to compile.'))
      console.log()
      if (formattedErrors.some(isLikelyASyntaxError)) {
        // If there are any syntax errors, show just them.
        // This prevents a confusing ESLint parsing error preceding a much more
        // useful Babel syntax error.
        formattedErrors = formattedErrors.filter(isLikelyASyntaxError)
      }
      formattedErrors.forEach(message => {
        console.log(message)
        console.log()
      })
      return
    }

    if (hasWarnings) {
      console.log(yellow('Compiled with warnings.'))
      console.log()
      formattedWarnings.forEach(message => {
        console.log(message)
        console.log()
      })

      console.log('You may use special comments to disable some warnings.')
      console.log(`Use ${yellow('// eslint-disable-next-line')} to ignore the next line.`)
      console.log(`Use ${yellow('/* eslint-disable */')} to ignore all warnings in a file.`)
    }
  }

  invalid() {
    clearConsole()
    console.log('Compiling...')
  }
}
