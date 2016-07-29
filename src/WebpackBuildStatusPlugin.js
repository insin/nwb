import fs from 'fs'
import path from 'path'

import {cyan, dim, green, red, yellow} from 'chalk'
import filesize from 'filesize'
import {sync as gzipSize} from 'gzip-size'

import {clearConsole} from './utils'

const FRIENDLY_SYNTAX_ERROR_LABEL = 'Syntax error:'

function filterMessage(message) {
  // Useless extra error message related to css-loader
  if (message.indexOf('css-loader') !== -1 &&
      message.indexOf("Module build failed: TypeError: Cannot read property 'toString' of undefined") !== -1) {
    return false
  }
  return true
}

function formatMessage(message) {
  return message
    // Make some common errors shorter:
    .replace(
      // Babel syntax error
      'Module build failed: SyntaxError:',
      FRIENDLY_SYNTAX_ERROR_LABEL
    )
    .replace(
      // Webpack file not found error
      /Module not found: Error: Cannot resolve 'file' or 'directory'/,
      'Module not found:'
    )
    // Internal stacks are generally useless so we strip them
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '') // at ... ...:x:y
    // Webpack loader names obscure CSS filenames
    .replace(/^.*css-loader.*!/gm, '')
}

function isLikelyASyntaxError(message) {
  return message.indexOf(FRIENDLY_SYNTAX_ERROR_LABEL) !== -1
}

function formatMessages(messages, type) {
  return messages.filter(filterMessage).map(
    message => `${type} in ${formatMessage(message)}`
  )
}

function logErrorsAndWarnings(stats) {
  let json = stats.toJson()
  let formattedErrors = formatMessages(json.errors, 'Error')
  let formattedWarnings = formatMessages(json.warnings, 'Warning')

  if (stats.hasErrors()) {
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

  if (stats.hasWarnings()) {
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

function logGzippedFileSizes(stats) {
  console.log('File sizes after gzip:')
  console.log()

  let outputPath = stats.compilation.outputOptions.path
  let outputDir = path.basename(outputPath)

  let names = Object.keys(stats.compilation.assets).filter(name => /\.(css|js)$/.test(name))
  let longest = names.reduce((max, {length}) => (length > max ? length : max), 0)
  let pad = (name) => Array(longest - name.length + 1).join(' ')

  names
    .map(name => ({
      name,
      // TODO Can we get asset source from the compilation instead?
      size: gzipSize(fs.readFileSync(path.join(outputPath, name)))
    }))
    .sort((a, b) => b.size - a.size)
    .forEach(({name, size}) => {
      console.log(
        `  ${dim(`${outputDir}/`)}${cyan(name)}` +
        `  ${pad(name)}${green(filesize(size))}`
      )
    })
}

/**
 * Displays appropriate build status based on which mode it's in:
 *
 *                                 ┌──────────────────────┐
 *                                 │         Modes        │
 *   ┌─────────────────────────────┼───────┬───────┬──────┤
 *   │ Feature                     │ build │ serve │ test │
 *   ├─────────────────────────────┼───────┼───────┼──────┤
 *   │ Build successful message    │   x   │   x   │      │
 *   │ Provided info message       │   x   │   x   │   x  │
 *   │ Tidied errors and warnings  │   x   │   x   │   x  │
 *   │ Emitted file gzip sizes     │   x   │       │      │
 *   │ Refresh console on rebuild  │       │   x   │      │
 *   └─────────────────────────────┴───────┴───────┴──────┘
 *
 * Based on create-react-app@0.2's start and build scripts.
 */
export default class BuildStatusPlugin {
  constructor({message = '', mode} = {}) {
    this.message = message
    this.mode = mode

    this.done = this.done.bind(this)
    this.invalid = this.invalid.bind(this)
  }

  apply(compiler) {
    compiler.plugin('done', this.done)
    compiler.plugin('invalid', this.invalid)
  }

  /**
   * Triggered when the current build is finished.
   */
  done(stats) {
    if (this.mode === 'serve') {
      clearConsole()
    }

    let hasErrors = stats.hasErrors()
    let hasWarnings = stats.hasWarnings()

    if (!hasErrors && !hasWarnings) {
      if (this.mode === 'build' || this.mode === 'serve') {
        console.log(green('Compiled successfully.'))
        console.log()
      }
    }
    else {
      logErrorsAndWarnings(stats)
      if (hasErrors) return
    }

    if (this.message) {
      console.log(this.message)
      console.log()
    }

    if (this.mode === 'build') {
      logGzippedFileSizes(stats)
    }
  }

  /**
   * Triggered when a file change was detected in watch mode.
   */
  invalid() {
    if (this.mode === 'serve') {
      clearConsole()
      console.log('Compiling...')
    }
  }
}
