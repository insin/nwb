import path from 'path'
import {execSync} from 'child_process'

import glob from 'glob'
import ora from 'ora'

import {getDefaultHTMLConfig} from '../appConfig'
import webpackBuild from '../webpackBuild'
import {logBuildResults} from '../webpackUtils'
import cleanApp from './clean-app'
import debug from '../debug'

// Using a config function as webpackBuild() sets NODE_ENV to production if it
// hasn't been set by the user and we don't want production optimisations in
// development builds.
function buildConfig(args) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    babel: {
      commonJSInterop: true,
      presets: ['react'],
    },
    devtool: 'source-map',
    entry: {
      app: [entry],
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: getDefaultHTMLConfig(),
      vendor: args.vendor !== false,
    },
  }

  if (glob.sync('public/').length !== 0) {
    config.plugins.copy = [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}]
  }

  if (args.inferno) {
    config.resolve = {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    }
  }
  else if (args.preact) {
    config.resolve = {
      alias: {
        'react': 'preact-compat',
        'react-dom': 'preact-compat',
      }
    }
  }

  if (production) {
    config.babel.presets.push('react-prod')
  }

  return config
}

/**
 * Build a React app.
 */
export default function buildReactApp(args, cb) {
  let dist = args._[2] || 'dist'

  cleanApp({_: ['clean-app', dist]})

  let library = 'React'

  if (args.preact || args.inferno) {
    const cwd = path.resolve('./')
    const pkg = require(path.resolve('./package.json'))

    const compat = args.preact ? 'preact-compat preact' : 'inferno-compat'
    const command = `npm install --save ${compat}`

    library = args.preact ? 'Preact (React compat)' : 'Inferno (React compat)'

    if (args.preact && (!pkg.dependencies['preact-compat'] || !pkg.dependencies['preact'])) {
      console.log('Install missing Preact dependencies')
      debug(`${cwd} $ ${command}`)
      execSync(command, {cwd, stdio: 'inherit'})
    }
    if (args.inferno && !pkg.dependencies['inferno-compat']) {
      console.log('Install missing Inferno dependencies')
      debug(`${cwd} $ ${command}`)
      execSync(command, {cwd, stdio: 'inherit'})
    }
  }

  let spinner = ora(`Building ${library} app`).start()
  webpackBuild(args, buildConfig, (err, stats) => {
    if (err) {
      spinner.fail()
      return cb(err)
    }
    logBuildResults(stats, spinner)
    cb()
  })
}
