import {validateOptions} from 'babel-preset-proposals'
import chalk from 'chalk'

import {padLines, pluralise as s, toSource, typeOf} from '../utils'

// TODO Remove - deprecated
let warnedAboutStageConfig = false
const STAGE_3_PROPOSALS = {
  dynamicImport: true,
  importMeta: true,
  classProperties: true,
  numericSeparator: true,
  // Actually Stage 4, but still...
  exportNamespaceFrom: true,
}
const STAGE_2_PROPOSALS = {
  ...STAGE_3_PROPOSALS,
  decorators: true,
  functionSent: true,
  logicalAssignmentOperators: true,
  throwExpressions: true,
}
const STAGE_1_PROPOSALS = {
  ...STAGE_2_PROPOSALS,
  exportDefaultFrom: true,
  pipelineOperator: true,
  doExpressions: true,
}
const PROPOSALS_BY_STAGE = {
  0: {all: true},
  1: STAGE_1_PROPOSALS,
  2: STAGE_2_PROPOSALS,
  3: STAGE_3_PROPOSALS,
}

export function processBabelConfig({report, userConfig}) {
  let {
    cherryPick,
    env,
    loose,
    plugins,
    presets,
    proposals,
    removePropTypes,
    reactConstantElements,
    runtime,
    stage,
    config,
    ...unexpectedConfig
  } = userConfig.babel

  let unexpectedProps = Object.keys(unexpectedConfig)
  if (unexpectedProps.length > 0) {
    report.error(
      'babel',
      unexpectedProps.join(', '),
      `Unexpected prop${s(unexpectedProps.length)} in ${chalk.cyan('babel')} config - ` +
      'see https://github.com/insin/nwb/blob/master/docs/Configuration.md#babel-configuration for supported config'
    )
  }

  // cherryPick
  if ('cherryPick' in userConfig.babel) {
    if (typeOf(cherryPick) !== 'string' && typeOf(cherryPick) !== 'array') {
      report.error(
        'babel.cherryPick',
        cherryPick,
        `Must be a ${chalk.cyan('String')} or an ${chalk.cyan('Array')}`
      )
    }
  }

  // env
  if ('env' in userConfig.babel) {
    if (typeOf(env) !== 'object') {
      report.error(
        'babel.env',
        env,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
  }

  // loose
  if ('loose' in userConfig.babel) {
    if (typeOf(loose) !== 'boolean') {
      report.error(
        'babel.loose',
        loose,
        `Must be ${chalk.cyan('Boolean')}`
      )
    }
  }

  // plugins
  if ('plugins' in userConfig.babel) {
    if (typeOf(plugins) === 'string') {
      userConfig.babel.plugins = [plugins]
    }
    else if (typeOf(userConfig.babel.plugins) !== 'array') {
      report.error(
        'babel.plugins',
        plugins,
        `Must be a ${chalk.cyan('String')} or an ${chalk.cyan('Array')}`
      )
    }
  }

  // presets
  if ('presets' in userConfig.babel) {
    if (typeOf(presets) === 'string') {
      userConfig.babel.presets = [presets]
    }
    else if (typeOf(presets) !== 'array') {
      report.error(
        'babel.presets',
        presets,
        `Must be a ${chalk.cyan('String')} or an ${chalk.cyan('Array')}`
      )
    }
  }

  // proposals
  if ('proposals' in userConfig.babel) {
    if (typeOf(proposals) === 'object') {
      let errors = validateOptions(proposals)
      if (errors.length) {
        report.error('babel.proposals', null, errors.join('\n'))
      }
    }
    else if (proposals !== false) {
      report.error(
        'babel.proposals',
        proposals,
        `Must be an ${chalk.cyan('Object')} (to configure proposal plugins) or ` +
        `${chalk.cyan('false')} (to disable use of proposal plugins)`
      )
    }
  }

  // removePropTypes
  if ('removePropTypes' in userConfig.babel) {
    if (removePropTypes !== false && typeOf(removePropTypes) !== 'object') {
      report.error(
        `babel.removePropTypes`,
        removePropTypes,
        `Must be ${chalk.cyan('false')} (to disable removal of PropTypes) ` +
        `or an ${chalk.cyan('Object')} (to configure react-remove-prop-types)`
      )
    }
  }

  // reactConstantElements
  if ('reactConstantElements' in userConfig.babel) {
    if (typeOf(reactConstantElements) !== 'boolean') {
      report.error(
        'babel.reactConstantElements',
        reactConstantElements,
        `Must be ${chalk.cyan('Boolean')}`
      )
    }
  }

  // runtime
  if ('runtime' in userConfig.babel) {
    if (typeOf(runtime) !== 'object' && runtime !== false) {
      report.error(
        'babel.runtime',
        runtime,
        `Must be an ${chalk.cyan('Object')} (to configure transform-runtime options) or ` +
        `${chalk.cyan('false')} (to disable use of the runtime-transform plugin)`
      )
    }
  }

  // TODO Remove - deprecated
  // stage
  if ('stage' in userConfig.babel) {
    let hasProposalsConfig = 'proposals' in userConfig.babel
    let deprecationMessages = [
      'Deprecated as of nwb v0.24.0, as Babel 7 no longer has preset-stage-X presets',
      'Use babel.proposals config instead to enable the required proposal plugins',
    ]

    if (typeOf(stage) === 'number') {
      if (stage < 0 || stage > 3) {
        report.error(
          'babel.stage',
          stage,
          `Must be between ${chalk.cyan(0)} and ${chalk.cyan(3)}`
        )
      }
      else if (!hasProposalsConfig) {
        deprecationMessages.push(
          `For now, nwb will enable proposal plugins corresponding to the final version of preset-stage-${stage}`,
          `This is equivalent to the following babel.proposals config:`,
          '',
          ...padLines(toSource(PROPOSALS_BY_STAGE[stage])).split('\n')
        )
        userConfig.babel.proposals = {...PROPOSALS_BY_STAGE[stage]}
      }
    }
    else if (stage !== false) {
      report.error(
        'babel.stage',
        stage,
        `Must be a ${chalk.cyan('Number')} between ${chalk.cyan(0)} and ${chalk.cyan(3)} (to choose a stage preset), ` +
        `or ${chalk.cyan('false')} (to disable use of a stage preset)`
      )
    }
    else {
      if (!hasProposalsConfig) {
        deprecationMessages.push(
          `For now, nwb will disable use of proposal plugins`,
          `This is equivalent to configuring ${chalk.cyan('babel.proposals = false')}`
        )
        userConfig.babel.proposals = false
      }
    }

    if (!warnedAboutStageConfig) {
      report.deprecated('babel.stage', ...deprecationMessages)
      warnedAboutStageConfig = true
    }
  }

  // config
  if ('config' in userConfig.babel && typeOf(config) !== 'function') {
    report.error(
      `babel.config`,
      `type: ${typeOf(config)}`,
      `Must be a ${chalk.cyan('Function')}`
    )
  }
}
