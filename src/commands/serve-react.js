import path from 'path'

import glob from 'glob'

import {UserError} from '../errors'
import serveReact from '../serveReact'

export default function(args, cb) {
  if (args._.length === 1) {
    console.log(`usage: nwb serve-react <entry module>`)
  }

  let entry = args._[1]
  if (glob.sync(entry).length === 0) {
    return cb(new UserError(`entry module not found: ${path.join(process.cwd(), entry)}`))
  }

  console.log('nwb: serve-react')
  serveReact(args, {
    entry,
    output: {
      filename: 'app.js',
      path: __dirname,
      publicPath: '/'
    },
    plugins: {
      html: {
        mountId: args['mount-id'] || 'app',
        title: args.title || 'nwb: serve-react'
      }
    }
  }, cb)
}
