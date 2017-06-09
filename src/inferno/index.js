// @flow
import {modulePath} from '../utils'

function getBaseConfig() {
  return {
    babel: {
      presets: [require.resolve('./inferno-preset')]
    },
    // Allow compatible React components to be used
    resolve: {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    },
  }
}

function getDependencies() {
  return ['inferno', 'inferno-component', 'inferno-compat']
}

function getQuickConfig() {
  return {
    commandConfig: getBaseConfig(),
    defaultTitle: 'Inferno App',
    renderShim: require.resolve('./renderShim'),
    renderShimAliases: {
      'inferno': modulePath('inferno'),
    }
  }
}

export default (args: Object) => ({
  getName: () => 'Inferno',
  getProjectDependencies: getDependencies,
  getBuildDependencies: () => [],
  getBuildConfig: getBaseConfig,
  getServeConfig: getBaseConfig,
  getQuickDependencies: getDependencies,
  getQuickBuildConfig: getQuickConfig,
  getQuickServeConfig: getQuickConfig,
  getKarmaTestConfig: getBaseConfig,
})
