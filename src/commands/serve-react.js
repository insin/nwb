import path from 'path'

import resolve from 'resolve'

import {UserError} from '../errors'
import serveReact from '../serveReact'
import {installReact} from '../utils'

/**
 * Serve a standalone React entry module.
 */
export default function serveReact_(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  // Install React if it's not available
  try {
    resolve.sync('react', {basedir: process.cwd()})
  }
  catch (e) {
    console.log('React is not available locally, installing...')
    installReact()
  }

  let entry = args._[1]
  let mountId = args['mount-id'] || 'app'

  serveReact(args, {
    babel: {
      stage: 0,
    },
    // Use a dummy entry module to try to render what was exported if nothing
    // has been rendered after importing the provided entry module.
    entry: [require.resolve('../reactRunEntry')],
    output: {
      filename: 'app.js',
      path: process.cwd(),
      publicPath: '/',
    },
    plugins: {
      define: {
        NWB_REACT_RUN_MOUNT_ID: JSON.stringify(mountId)
      },
      html: {
        mountId,
        title: args.title || 'React App',
      },
    },
    resolve: {
      alias: {
        // Allow the dummy entry module to import the provided entry module
        'nwb-react-run-entry': path.resolve(entry),
        // Allow the dummy entry module to resolve React and ReactDOM from the cwd
        'react': path.dirname(resolve.sync('react', {basedir: process.cwd()})),
        'react-dom': path.dirname(resolve.sync('react-dom', {basedir: process.cwd()})),
      }
    }
  }, cb)
}
