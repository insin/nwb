// Use a config function, as this won't be called until after NODE_ENV has been
// set by build-app and we don't want these optimisations in development builds.
let buildConfig = () => {
  let config = {}
  if (process.env.NODE_ENV === 'production') {
    config.loaders = {
      babel: {
        optional: [
          'optimisation.react.inlineElements',
          'optimisation.react.constantElements'
        ]
      }
    }
  }
  return config
}

export default function(args) {
  require('./build-app')(args, buildConfig)
}
