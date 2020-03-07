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
    return {compat: false}
  },
  getProjectDependencies(answers: Object): string[] {
    return getDependencies()
  },
  getProjectQuestions() {
    let defaults = this.getProjectDefaults()
    return [{
      when: () => !('compat' in args),
      type: 'confirm',
      name: 'compat',
      message: 'Do you want to use preact/compat so you can use React modules?',
      default: defaults.compat,
    }]
  },
  getBuildDependencies: () => [],
  getBuildConfig: getBaseConfig,
  getServeConfig: getBaseConfig,
  getQuickDependencies: (): string[] => getDependencies(),
  getQuickBuildConfig: getQuickConfig,
  getQuickServeConfig: getQuickConfig,
  getKarmaTestConfig: getBaseConfig,
})
