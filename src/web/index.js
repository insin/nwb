// @flow

function getBaseConfig() {
  return {}
}

function getDependencies() {
  return []
}

function getQuickConfig() {
  return {
    commandConfig: getBaseConfig(),
    defaultTitle: 'Web App',
  }
}

// Vanilla JavaScript apps just use the default config for everything
export default (args: Object) => ({
  getName: () => 'Web',
  getProjectDefaults: () => ({}),
  getProjectDependencies: getDependencies,
  getProjectQuestions: () => null,
  getBuildDependencies: getDependencies,
  getBuildConfig: getBaseConfig,
  getServeConfig: getBaseConfig,
  getQuickDependencies: getDependencies,
  getQuickBuildConfig: getQuickConfig,
  getQuickServeConfig() {
    // Reload on unaccepted HMR changes by default; disable with --no-reload
    if (args.reload !== false) {
      args.reload = true
    }
    return getQuickConfig()
  },
  getKarmaTestConfig: getBaseConfig,
})
