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
  return ['preact']
}

function getCompatDependencies() {
  return ['preact-compat']
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
    let deps = getDependencies()
    if (answers.compat) {
      deps = deps.concat(getCompatDependencies())
    }
    return deps
  },
  getProjectQuestions() {
    let defaults = this.getProjectDefaults()
    return [{
      when: () => !('compat' in args),
      type: 'confirm',
      name: 'compat',
      message: 'Do you want to use preact-compat so you can use React modules?',
      default: defaults.compat,
    }]
  },
  getBuildDependencies: () => [],
  getBuildConfig: getBaseConfig,
  getServeConfig: getBaseConfig,
  getQuickDependencies: (): string[] => getDependencies().concat(getCompatDependencies()),
  getQuickBuildConfig: getQuickConfig,
  getQuickServeConfig: getQuickConfig,
  getKarmaTestConfig: getBaseConfig,
})
