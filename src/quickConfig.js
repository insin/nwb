import path from 'path'

import merge from 'webpack-merge'

/**
 * Create default command config for a quick app build and merge any extra
 * config provided into it.
 */
export function getBuildCommandConfig(args, options) {
  let {
    defaultTitle,
    extra = {},
    renderShim,
    renderShimAliases,
  } = options

  let entry = path.resolve(args._[1])
  let dist = path.resolve(args._[2] || 'dist')
  let mountId = args['mount-id'] || 'app'

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    babel: {
      stage: 0,
    },
    devtool: 'source-map',
    output: {
      chunkFilename: filenamePattern,
      filename: filenamePattern,
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId,
        title: args.title || defaultTitle,
      },
      // A vendor bundle must be explicitly enabled with a --vendor flag
      vendor: args.vendor,
    },
    resolve: {},
  }

  if (args.force === true) {
    config.entry = {app: [entry]}
  }
  else {
    // Use a render shim module which supports quick prototyping
    config.entry = {app: [require.resolve(renderShim)]}
    config.plugins.define = {NWB_QUICK_MOUNT_ID: JSON.stringify(mountId)}
    config.resolve.alias = {
      // Allow the render shim module to import the provided entry module
      'nwb-quick-entry': entry,
      // Allow the render shim module to import modules from the cwd
      ...renderShimAliases,
    }
  }

  if (args.polyfill === false || args.polyfills === false) {
    config.polyfill = false
  }

  return merge(config, extra)
}
