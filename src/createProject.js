import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import copyTemplateDir from 'copy-template-dir'
import inquirer from 'inquirer'

import {
  CONFIG_FILE_NAME, PROJECT_TYPES, REACT_APP, REACT_COMPONENT, REACT_VERSION, WEB_APP, WEB_MODULE
} from './constants'
import {UserError} from './errors'
import pkg from '../package.json'
import {installReact} from './utils'

let nwbVersion = pkg.version.split('.').slice(0, 2).concat('x').join('.')

// Hack to generate simple config file contents without JSON formatting
let toSource = (obj) => JSON.stringify(obj, null, 2)
                            .replace(/"([^"]+)":/g, '$1:')
                            .replace(/"/g, "'")

function writeConfigFile(dir, config) {
  fs.writeFileSync(
    path.join(dir, CONFIG_FILE_NAME),
    `module.exports = ${toSource(config)}\n`
  )
}

export function getWebModulePrefs(args, done) {
  // Pass a UMD global variable name with --umd=MyThing, or pass something like
  // --no-umd to indicate you don't want a UMD build.
  let umd = args.umd || false
  // An ES6 modules build is enabled by default, but can be disabled with
  // --no-native-modules or --native-modules=false (or a bunch of other stuff)
  let nativeModules = args['native-modules'] !== false && !/^(0|false|no|off)$/.test(args['native-modules'])

  // Don't ask questions if the user doesn't want them, or already told us all
  // the answers.
  if ((args.f || args.force) || ('umd' in args && 'native-modules' in args)) {
    return done(null, {umd, nativeModules})
  }

  inquirer.prompt([
    {
      when: () => !('native-modules' in args),
      type: 'confirm',
      name: 'nativeModules',
      message: 'Do you want to create an ES6 modules build?',
      default: nativeModules,
    },
    {
      when: () => !('umd' in args),
      type: 'confirm',
      name: 'createUMD',
      message: 'Do you want to create a UMD build?',
      default: false,
    },
    {
      when: ({createUMD}) => createUMD,
      type: 'input',
      name: 'umd',
      message: 'Which global variable name should the UMD build export?',
      validate(input) {
        return input.trim() ? true : 'Required to create a UMD build'
      },
      default: umd,
    },
  ]).then(answers => done(null, answers), err => done(err))
}

function logCreatedFiles(targetDir, createdFiles) {
  createdFiles.sort().forEach(createdFile => {
    let relativePath = path.relative(targetDir, createdFile)
    console.log(`  ${chalk.green('create')} ${relativePath}`)
  })
}

export function npmModuleVars(vars) {
  vars.nativeModulesMain =
    vars.nativeModules ? '\n  "jsnext:main": "es6/index.js",\n  "modules": "es6/index.js",' : ''
  return vars
}

export function validateProjectType(projectType) {
  if (!projectType) {
    throw new UserError(`A project type must be provided, one of: ${PROJECT_TYPES.join(', ')}`)
  }
  if (PROJECT_TYPES.indexOf(projectType) === -1) {
    throw new UserError(`Project type must be one of: ${PROJECT_TYPES.join(', ')}`)
  }
}

const PROJECT_CREATORS = {
  [REACT_APP](args, name, targetDir, cb) {
    let templateDir = path.join(__dirname, `../templates/${REACT_APP}`)
    let reactVersion = args.react || REACT_VERSION
    let templateVars = {name, nwbVersion, reactVersion}
    copyTemplateDir(templateDir, targetDir, templateVars, (err, createdFiles) => {
      if (err) return cb(err)
      logCreatedFiles(targetDir, createdFiles)
      console.log('Installing dependencies...')
      try {
        installReact({cwd: targetDir, version: reactVersion, save: true})
      }
      catch (e) {
        return cb(e)
      }
      cb()
    })
  },

  [REACT_COMPONENT](args, name, targetDir, cb) {
    getWebModulePrefs(args, (err, prefs) => {
      if (err) return cb(err)
      let {umd, nativeModules} = prefs
      let templateDir = path.join(__dirname, `../templates/${REACT_COMPONENT}`)
      let reactVersion = args.react || REACT_VERSION
      let templateVars = npmModuleVars(
        {name, nativeModules, nwbVersion, reactVersion}
      )
      copyTemplateDir(templateDir, targetDir, templateVars, (err, createdFiles) => {
        if (err) return cb(err)
        try {
          writeConfigFile(targetDir, {
            type: 'react-component',
            npm: {
              nativeModules: nativeModules,
              umd: umd ? {global: umd, externals: {react: 'React'}} : false
            }
          })
        }
        catch (e) {
          return cb(e)
        }
        logCreatedFiles(targetDir, createdFiles)
        console.log('Installing dependencies...')
        try {
          installReact({cwd: targetDir, version: reactVersion, dev: true, save: true})
        }
        catch (e) {
          return cb(e)
        }
        cb()
      })
    })
  },

  [WEB_APP](args, name, targetDir, cb) {
    let templateDir = path.join(__dirname, `../templates/${WEB_APP}`)
    let templateVars = {name, nwbVersion}
    copyTemplateDir(templateDir, targetDir, templateVars, (err, createdFiles) => {
      if (err) return cb(err)
      logCreatedFiles(targetDir, createdFiles)
      cb()
    })
  },

  [WEB_MODULE](args, name, targetDir, cb) {
    getWebModulePrefs(args, (err, prefs) => {
      if (err) return cb(err)
      let {umd, nativeModules} = prefs
      let templateDir = path.join(__dirname, `../templates/${WEB_MODULE}`)
      let templateVars = npmModuleVars(
        {name, nativeModules, nwbVersion}
      )
      copyTemplateDir(templateDir, targetDir, templateVars, (err, createdFiles) => {
        if (err) return cb(err)
        try {
          writeConfigFile(targetDir, {
            type: 'web-module',
            npm: {
              nativeModules: nativeModules,
              umd: umd ? {global: umd, externals: {}} : false,
            }
          })
        }
        catch (e) {
          return cb(e)
        }
        logCreatedFiles(targetDir, createdFiles)
        cb()
      })
    })
  }
}

export default function createProject(args, type, name, dir, cb) {
  PROJECT_CREATORS[type](args, name, dir, cb)
}
