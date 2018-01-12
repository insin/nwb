import {exec} from 'child_process'
import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import copyTemplateDir from 'copy-template-dir'
import inquirer from 'inquirer'
import ora from 'ora'
import runSeries from 'run-series'

import {
  CONFIG_FILE_NAME, PROJECT_TYPES, REACT_COMPONENT, WEB_MODULE,
} from './constants'
import {UserError} from './errors'
import pkg from '../package.json'
import {directoryExists, install, toSource, typeOf} from './utils'

// TODO Change if >= 1.0.0 ever happens
const NWB_VERSION = pkg.version.split('.').slice(0, 2).concat('x').join('.')

/**
 * Copy a project template and log created files if successful.
 */
function copyTemplate(templateDir, targetDir, templateVars, cb) {
  copyTemplateDir(templateDir, targetDir, templateVars, (err, createdFiles) => {
    if (err) return cb(err)
    createdFiles.sort().forEach(createdFile => {
      let relativePath = path.relative(targetDir, createdFile)
      console.log(`  ${chalk.green('create')} ${relativePath}`)
    })
    cb()
  })
}

/**
 * Prompt the user for preferences related to publishing a module to npm, unless
 * they've asked us not to or have already provided all the possible options via
 * arguments.
 */
export function getNpmModulePrefs(args, cb) {
  // An ES modules build is enabled by default, but can be disabled with
  // --no-es-modules or --es-modules=false (or a bunch of other undocumented
  // stuff)
  let esModules = args['es-modules'] !== false && !/^(0|false|no|nope|off)$/.test(args['es-modules'])
  // Pass a UMD global variable name with --umd=MyThing, or pass --no-umd to
  // indicate you don't want a UMD build.
  let umd = typeOf(args.umd) === 'string' ? args.umd : false

  // Don't ask questions if the user doesn't want them, or already told us all
  // the answers.
  if ((args.f || args.force) || ('umd' in args && 'es-modules' in args)) {
    return process.nextTick(cb, null, {umd, esModules})
  }

  inquirer.prompt([
    {
      when: () => !('es-modules' in args),
      type: 'confirm',
      name: 'esModules',
      message: 'Do you want to create an ES modules build for use by compatible bundlers?',
      default: esModules,
    },
    {
      when: () => !('umd' in args),
      type: 'confirm',
      name: 'createUMD',
      message: 'Do you want to create a UMD build for global usage via <script> tag?',
      default: umd,
    },
    {
      when: ({createUMD}) => createUMD,
      type: 'input',
      name: 'umd',
      message: 'Which global variable should the UMD build set?',
      validate(input) {
        return input.trim() ? true : 'Required to create a UMD build'
      },
      default: umd || '',
    },
  ]).then(answers => cb(null, answers), err => cb(err))
}

/**
 * Initialise a Git repository if the user has Git, unless there's already one
 * present or the user has asked us could we not.
 */
function initGit(args, cwd, cb) {
  // Allow git init to be disabled with a --no-git flag
  if (args.git === false) {
    return process.nextTick(cb)
  }
  // Bail if a git repo already exists (e.g. nwb init in an existing repo)
  if (directoryExists(path.join(cwd, '.git'))) {
    return process.nextTick(cb)
  }

  exec('git --version', {cwd, stdio: 'ignore'}, (err) => {
    if (err) return cb()
    let spinner = ora('Initing Git repo').start()
    runSeries([
      (cb) => exec('git init', {cwd}, cb),
      (cb) => exec('git add .', {cwd}, cb),
      (cb) => exec(`git commit -m "Initial commit from nwb v${pkg.version}"`, {cwd}, cb),
    ], (err) => {
      if (err) {
        spinner.fail()
        console.log(chalk.red(err.message))
        return cb()
      }
      spinner.succeed()
      cb()
    })
  })
}

/**
 * Validate a user-supplied project type.
 */
export function validateProjectType(projectType) {
  if (!projectType) {
    throw new UserError(`A project type must be provided, one of: ${Array.from(PROJECT_TYPES).join(', ')}`)
  }
  if (!PROJECT_TYPES.has(projectType)) {
    throw new UserError(`Project type must be one of: ${Array.from(PROJECT_TYPES).join(', ')}`)
  }
}

/**
 * Write an nwb config file.
 */
function writeConfigFile(dir, config, cb) {
  fs.writeFile(
    path.join(dir, CONFIG_FILE_NAME),
    `module.exports = ${toSource(config)}\n`,
    cb
  )
}

const MODULE_PROJECT_CONFIG = {
  [REACT_COMPONENT]: {
    devDependencies: ['react', 'react-dom'],
    externals: {react: 'React'},
  },
  [WEB_MODULE]: {},
}

/**
 * Create an app project skeleton.
 */
function createAppProject(args, projectType, name, targetDir, cb) {
  let appType = projectType.split('-')[0]
  let projectConfig = require(`./${appType}`)(args)

  let dependencies = null

  let tasks = [
    (cb) => {
      let templateDir = path.join(__dirname, `../templates/${projectType}`)
      let templateVars = {name, nwbVersion: NWB_VERSION}
      copyTemplate(templateDir, targetDir, templateVars, cb)
    },
    (cb) => {
      // Allow specification of the exact version, e.g. --react=16.2
      if (dependencies.length !== 0 && args[appType]) {
        dependencies = dependencies.map(pkg => `${pkg}@${args[appType]}`)
      }
      install(dependencies, {cwd: targetDir, save: true}, cb)
    },
    (cb) => initGit(args, targetDir, cb),
  ]

  let questions = projectConfig.getProjectQuestions()
  if (questions) {
    // Don't ask questions if the user doesn't want them
    if (args.f || args.force) {
      dependencies = projectConfig.getProjectDependencies(
        projectConfig.getProjectDefaults()
      )
    }
    else {
      tasks.unshift((cb) => {
        inquirer.prompt(questions).then(
          (answers) => {
            dependencies = projectConfig.getProjectDependencies(answers)
            cb(null)
          },
          (err) => cb(err)
        )
      })
    }
  }
  else {
    dependencies = projectConfig.getProjectDependencies()
  }

  runSeries(tasks, cb)
}

/**
 * Create an npm module project skeleton.
 */
function createModuleProject(args, projectType, name, targetDir, cb) {
  let {devDependencies = [], externals = {}} = MODULE_PROJECT_CONFIG[projectType]
  getNpmModulePrefs(args, (err, prefs) => {
    if (err) return cb(err)
    let {umd, esModules} = prefs
    let templateDir = path.join(__dirname, `../templates/${projectType}`)
    let templateVars = {
      name,
      esModules,
      esModulesPackageConfig: esModules ? '\n  "module": "es/index.js",' : '',
      nwbVersion: NWB_VERSION,
    }
    let nwbConfig = {
      type: projectType,
      npm: {
        esModules,
        umd: umd ? {global: umd, externals} : false
      }
    }

    // CBA making this part generic until it's needed
    if (projectType === REACT_COMPONENT) {
      if (args.react) {
        devDependencies = devDependencies.map(pkg => `${pkg}@${args.react}`)
        templateVars.reactPeerVersion = `^${args.react}` // YOLO
      }
      else {
        // TODO Get from npm so we don't have to manually update on major releases
        templateVars.reactPeerVersion = '16.x'
      }
    }

    runSeries([
      (cb) => copyTemplate(templateDir, targetDir, templateVars, cb),
      (cb) => writeConfigFile(targetDir, nwbConfig, cb),
      (cb) => install(devDependencies, {cwd: targetDir, save: true, dev: true}, cb),
      (cb) => initGit(args, targetDir, cb),
    ], cb)
  })
}

export default function createProject(args, projectType, name, dir, cb) {
  if (/-app$/.test(projectType)) {
    return createAppProject(args, projectType, name, dir, cb)
  }
  else {
    createModuleProject(args, projectType, name, dir, cb)
  }
}
