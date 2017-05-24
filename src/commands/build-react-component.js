import runSeries from 'run-series'

import moduleBuild from '../moduleBuild'
import {directoryExists} from '../utils'
import buildDemo from './build-demo'

/**
 * Create a React component's ES5 and ES6 modules and UMD builds and build its
 * demo app if it has one.
 */
export default function buildModule(args, cb) {
  let config = {
    babel: {
      presets: ['react'],
    }
  }

  // Disable propTypes wrapping with --no-proptypes or --no-wrap-proptypes
  if (args.proptypes !== false && args['wrap-proptypes'] !== false) {
    // Wrap propTypes with an environment check
    config.babelDev = {
      plugins: [
        [require.resolve('babel-plugin-transform-react-remove-prop-types'), {
          mode: 'wrap',
        }]
      ]
    }
    // Strip propTypes from UMD production build
    config.babelProd = {
      plugins: [
        require.resolve('babel-plugin-transform-react-remove-prop-types'),
      ]
    }
  }

  let tasks = [(cb) => moduleBuild(args, config, cb)]
  // Disable demo build with --no-demo or --no-demo-build
  if (args.demo !== false &&
      args['demo-build'] !== false &&
      directoryExists('demo')) {
    tasks.push((cb) => buildDemo(args, cb))
  }
  runSeries(tasks, cb)
}
