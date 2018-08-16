// @flow
import resolve from 'resolve'

import {modulePath} from '../utils'

function getBaseConfig() {
  let config: Object = {
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
  // Inferno's default module build is the production version - use the
  // development version for development and testing.
  if (process.env.NODE_ENV !== 'production') {
    config.resolve.alias['inferno'] = resolve.sync('inferno/dist/index.dev.esm.js', {
      basedir: process.cwd()
    })
  }
  return config
}

function getDependencies() {
  return ['inferno']
}

function getCompatDependencies() {
  return ['inferno-compat', 'inferno-clone-vnode', 'inferno-create-class', 'inferno-create-element']
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
      message: 'Do you want to use inferno-compat so you can use React modules?',
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
