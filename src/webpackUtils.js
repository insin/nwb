import path from 'path'

import chalk from 'chalk'
import figures from 'figures'
import filesize from 'filesize'
import {sync as gzipSize} from 'gzip-size'

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

function getFileDetails(stats) {
  let outputPath = stats.compilation.outputOptions.path
  return Object.keys(stats.compilation.assets)
    .filter(assetName => /\.(css|js)$/.test(assetName))
    .map(assetName => {
      let size = gzipSize(stats.compilation.assets[assetName].source())
      return {
        dir: path.dirname(path.join(path.relative(process.cwd(), outputPath), assetName)),
        name: path.basename(assetName),
        size,
        sizeLabel: filesize(size),
      }
    })
}

export function logBuildResults(stats, spinner) {
  if (stats.hasErrors()) {
    spinner.fail()
    console.log()
    logErrorsAndWarnings(stats)
  }
  else if (stats.hasWarnings()) {
    spinner.stopAndPersist(chalk.yellow(figures.warning))
    console.log()
    logErrorsAndWarnings(stats)
    console.log()
    logGzippedFileSizes(stats)
  }
  else {
    spinner.succeed()
    console.log()
    logGzippedFileSizes(stats)
  }
}

export function logErrorsAndWarnings(stats) {
  let json = stats.toJson()
  let formattedErrors = formatMessages(json.errors, 'Error')
  let formattedWarnings = formatMessages(json.warnings, 'Warning')

  if (stats.hasErrors()) {
    console.log(chalk.red('Failed to compile.'))
    if (formattedErrors.some(isLikelyASyntaxError)) {
      // If there are any syntax errors, show just them.
      // This prevents a confusing ESLint parsing error preceding a much more
      // useful Babel syntax error.
      formattedErrors = formattedErrors.filter(isLikelyASyntaxError)
    }
    formattedErrors.forEach(message => {
      console.log()
      console.log(message)
    })
    return
  }

  if (stats.hasWarnings()) {
    console.log(chalk.yellow('Compiled with warnings.'))
    formattedWarnings.forEach(message => {
      console.log()
      console.log(message)
    })

    console.log()
    console.log('You may use special comments to disable some warnings.')
    console.log(`Use ${chalk.yellow('// eslint-disable-next-line')} to ignore the next line.`)
    console.log(`Use ${chalk.yellow('/* eslint-disable */')} to ignore all warnings in a file.`)
  }
}

/**
 * Take any number of Webpack Stats objects and log the gzipped size of the JS
 * and CSS assets they contain, largest-first.
 */
export function logGzippedFileSizes(...stats) {
  let files = stats.reduce((files, stats) => (files.concat(getFileDetails(stats))), [])

  let longest = files.reduce((max, {dir, name}) => {
    let length = (dir + name).length
    return length > max ? length : max
  }, 0)
  let pad = (dir, name) => Array(longest - (dir + name).length + 1).join(' ')

  console.log(`File size${files.length === 1 ? '' : 's'} after gzip:`)
  console.log()

  files
    .sort((a, b) => b.size - a.size)
    .forEach(({dir, name, sizeLabel}) => {
      console.log(
        `  ${chalk.dim(`${dir}${path.sep}`)}${chalk.cyan(name)}` +
        `  ${pad(dir, name)}${chalk.green(sizeLabel)}`
      )
    })

  console.log()
}

