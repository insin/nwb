// @flow
import {modulePath} from '../utils'

function getBaseConfig() {
  return {
    babel: {
      presets: [require.resolve('./preact-preset')]
    },
    // Allow compatible React components to be used
    resolve: {
      alias: {
        'react': 'preact-compat',
        'react-dom': 'preact-compat',
        'create-react-class': 'preact-compat/lib/create-react-class',
      }
    },
  }
}

function getDependencies() {
  return ['preact', 'preact-compat']
}

function getQuickConfig() {
  return {
    commandConfig: getBaseConfig(),
    defaultTitle: 'Preact App',
    renderShim: require.resolve('./renderShim'),
    renderShimAliases: {
      'preact': modulePath('preact'),
    }
  }
}

export default (args: Object) => ({
  getName: () => 'Preact',
  getProjectDependencies: getDependencies,
  getBuildDependencies: () => [],
  getBuildConfig: getBaseConfig,
  getServeConfig: getBaseConfig,
  getQuickDependencies: getDependencies,
  getQuickBuildConfig: getQuickConfig,
  getQuickServeConfig: getQuickConfig,
  getKarmaTestConfig: getBaseConfig,
})
