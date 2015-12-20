import path from 'path'
import {execSync} from 'child_process'

import copyTemplateDir from 'copy-template-dir'
import inquirer from 'inquirer'
import glob from 'glob'

import {
  REACT_APP, REACT_COMPONENT, REACT_VERSION as reactVersion, WEB_APP, WEB_MODULE, PROJECT_TYPES
} from '../constants'
import debug from '../debug'
import {UserError} from '../errors'
import pkg from '../../package.json'

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

export function npmModuleVars(vars) {
  vars.jsNextMain = vars.jsNext ? '\n  "jsnext:main": "es6/index.js",' : ''
  return vars
}

let projectCreators = {
  [REACT_APP](args, name, targetDir, cb) {
    let templateDir = path.join(__dirname, `../../templates/${REACT_APP}`)
    let templateVars = {name, nwbVersion, reactVersion}
    copyTemplateDir(templateDir, targetDir, templateVars, err => {
      if (err) return cb(err)
      console.log(`nwb: created ${targetDir}`)
      console.log('nwb: installing dependencies')
      installReact(targetDir)
      cb()
    })
  },

  [REACT_COMPONENT](args, name, targetDir, cb) {
    getWebModulePrefs(args, ({umd, globalVariable, jsNext}) => {
      let templateDir = path.join(__dirname, `../../templates/${REACT_COMPONENT}`)
      let templateVars = npmModuleVars(
        {umd, globalVariable, jsNext, name, nwbVersion, reactVersion}
      )
      copyTemplateDir(templateDir, targetDir, templateVars, err => {
        if (err) return cb(err)
        console.log(`nwb: created ${targetDir}`)
        console.log('nwb: installing dependencies')
        installReact(targetDir)
        cb()
      })
    })
  },

  [WEB_APP](args, name, targetDir, cb) {
    let templateDir = path.join(__dirname, `../../templates/${WEB_APP}`)
    let templateVars = {name, nwbVersion}
    copyTemplateDir(templateDir, targetDir, templateVars, err => {
      if (err) return cb(err)
      console.log(`nwb: created ${targetDir}`)
      cb()
    })
  },

  [WEB_MODULE](args, name, targetDir, cb) {
    getWebModulePrefs(args, ({umd, globalVariable, jsNext}) => {
      let templateDir = path.join(__dirname, `../../templates/${WEB_MODULE}`)
      let templateVars = npmModuleVars(
        {umd, globalVariable, jsNext, name, nwbVersion}
      )
      copyTemplateDir(templateDir, targetDir, templateVars, err => {
        if (err) return cb(err)
        console.log(`nwb: created ${targetDir}`)
        cb()
      })
    })
  }
}

export default function(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError(`usage: nwb new [${PROJECT_TYPES.join('|')}] <name>`))
  }

  let projectType = args._[1]
  if (!projectType) {
    return cb(new UserError(`nwb: a project type must be provided, one of: ${PROJECT_TYPES.join(', ')}`))
  }
  if (PROJECT_TYPES.indexOf(projectType) === -1) {
    return cb(new UserError(`nwb: project type must be one of: ${PROJECT_TYPES.join(', ')}`))
  }

  let name = args._[2]
  if (!name) {
    return cb(new UserError(`nwb: a project name must be provided`))
  }
  if (glob.sync(`${name}/`).length !== 0) {
    return cb(new UserError(`nwb: "${name}" directory already exists`))
  }

  let targetDir = path.join(process.cwd(), name)
  projectCreators[projectType](args, name, targetDir, cb)
}
