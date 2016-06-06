import path from 'path'

import resolve from 'resolve'

import {UserError} from '../errors'
import serveReact from '../serveReact'
import {installReact} from '../utils'

/**
 * Serve a standalone React entry module.
 */
export default function(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('nwb: serve-react: an entry module must be specified'))
  }

  // Install React if it's not available
  try {
    resolve.sync('react', {basedir: process.cwd()})
  }
  catch (e) {
    console.log('nwb: React is not available locally, installing...')
    installReact()
  }

  let entry = path.resolve(args._[1])

  console.log('nwb: serve-react')
  serveReact(args, {
    entry,
    output: {
      filename: 'app.js',
      path: process.cwd(),
      publicPath: '/'
    },
    loaders: {
      babel: {
        query: {
          stage: 0,
          optional: ['runtime']
        }
      }
    },
    plugins: {
      html: {
        mountId: args['mount-id'] || 'app',
        title: args.title || 'React App'
      }
    }
  }, cb)
}
