import path from 'path'
import {execSync} from 'child_process'

import chalk from 'chalk'
import copyTemplateDir from 'copy-template-dir'
import inquirer from 'inquirer'

import {
  REACT_APP, REACT_COMPONENT, REACT_VERSION as reactVersion, WEB_APP, WEB_MODULE, PROJECT_TYPES
} from './constants'
import debug from './debug'
import {UserError} from './errors'
import pkg from '../package.json'

let nwbVersion = `~${pkg.version}`

export function getWebModulePrefs(args, done) {
  // Determine defaults based on arguments
  let umd = true
  if (args.umd === false) {
    umd = false
  }
  else if (args.g || args.global) {
    umd = true
  }
  else if (args.f || args.force) {
    umd = false
  }
  let globalVariable = args.g || args.global || ''
  let jsNext = true
  if (args.jsnext === false) {
    jsNext = false
  }

  if (args.f || args.force) {
    return done({umd, globalVariable, jsNext})
  }

  inquirer.prompt([
    {
      type: 'confirm',
      name: 'umd',
      message: 'Do you want to create a UMD build for npm?',
      default: umd
    },
    {
      when: ({umd}) => umd,
      type: 'input',
      name: 'globalVariable',
      message: 'Which global variable should the UMD build export?',
      default: globalVariable
    },
    {
      type: 'confirm',
      name: 'jsNext',
      message: 'Do you want to create an ES6 modules build for npm?',
      default: jsNext
    }
  ], done)
}

function installReact(targetDir) {
  let command = `npm install react@${reactVersion} react-dom@${reactVersion}`
  debug(`${targetDir} $ ${command}`)
  execSync(command, {
    cwd: targetDir,
    stdio: [0, 1, 2]
  })
}

function logCreatedFiles(targetDir, createdFiles) {
  createdFiles.sort().forEach(createdFile => {
    let relativePath = path.relative(targetDir, createdFile)
    console.log(`  ${chalk.green('create')} ${relativePath}`)
  })
}

export function npmModuleVars(vars) {
  vars.jsNextMain = vars.jsNext ? '\n  "jsnext:main": "es6/index.js",' : ''
  return vars
}

export function validateProjectType(projectType) {
  if (!projectType) {
    throw new UserError(`nwb: a project type must be provided, one of: ${PROJECT_TYPES.join(', ')}`)
  }
  if (PROJECT_TYPES.indexOf(projectType) === -1) {
    throw new UserError(`nwb: project type must be one of: ${PROJECT_TYPES.join(', ')}`)
  }
}

const PROJECT_CREATORS = {
  [REACT_APP](args, name, targetDir, cb) {
    let templateDir = path.join(__dirname, `../templates/${REACT_APP}`)
    let templateVars = {name, nwbVersion, reactVersion}
    copyTemplateDir(templateDir, targetDir, templateVars, (err, createdFiles) => {
      if (err) return cb(err)
      logCreatedFiles(targetDir, createdFiles)
      console.log('nwb: installing dependencies')
      installReact(targetDir)
      cb()
    })
  },

  [REACT_COMPONENT](args, name, targetDir, cb) {
    getWebModulePrefs(args, ({umd, globalVariable, jsNext}) => {
      let templateDir = path.join(__dirname, `../templates/${REACT_COMPONENT}`)
      let templateVars = npmModuleVars(
        {umd, globalVariable, jsNext, name, nwbVersion, reactVersion}
      )
      copyTemplateDir(templateDir, targetDir, templateVars, (err, createdFiles) => {
        if (err) return cb(err)
        logCreatedFiles(targetDir, createdFiles)
        console.log('nwb: installing dependencies')
        installReact(targetDir)
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
    getWebModulePrefs(args, ({umd, globalVariable, jsNext}) => {
      let templateDir = path.join(__dirname, `../templates/${WEB_MODULE}`)
      let templateVars = npmModuleVars(
        {umd, globalVariable, jsNext, name, nwbVersion}
      )
      copyTemplateDir(templateDir, targetDir, templateVars, (err, createdFiles) => {
        if (err) return cb(err)
        logCreatedFiles(targetDir, createdFiles)
        cb()
      })
    })
  }
}

export default function(args, type, name, dir, cb) {
  PROJECT_CREATORS[type](args, name, dir, cb)
}
