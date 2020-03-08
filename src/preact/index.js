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
        'react': 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      }
    },
  }
}

function getDependencies() {
  return ['preact']
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
  getProjectDefaults() {
    return {}
  },
  getProjectDependencies(): string[] {
    return getDependencies()
  },
  getProjectQuestions() {
    return null
  },
  getBuildDependencies: () => [],
  getBuildConfig: getBaseConfig,
  getServeConfig: getBaseConfig,
  getQuickDependencies: (): string[] => getDependencies(),
  getQuickBuildConfig: getQuickConfig,
  getQuickServeConfig: getQuickConfig,
  getKarmaTestConfig: getBaseConfig,
})
