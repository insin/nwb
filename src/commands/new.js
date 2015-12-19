import path from 'path'
import {execSync} from 'child_process'

import copyTemplateDir from 'copy-template-dir'
import inquirer from 'inquirer'
import glob from 'glob'

import {
  REACT_APP, REACT_COMPONENT, REACT_VERSION as reactVersion, WEB_MODULE, PROJECT_TYPES
} from '../constants'
import debug from '../debug'
import {UserError} from '../errors'
import pkg from '../../package.json'

let nwbVersion = `~${pkg.version}`

function getWebModulePrefs(args, done) {
  if (args.f) {
    return done({umd: false, globalVariable: ''})
  }
  inquirer.prompt([
    {
      type: 'confirm',
      name: 'umd',
      message: 'Do you want nwb to create a UMD build for this module?',
      default: true
    },
    {
      when: ({umd}) => umd,
      type: 'input',
      name: 'globalVariable',
      message: 'Which global variable should the UMD build export?',
      default: ''
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
    getWebModulePrefs(args, ({umd, globalVariable}) => {
      let templateDir = path.join(__dirname, `../../templates/${REACT_COMPONENT}`)
      let templateVars = {umd, globalVariable, name, nwbVersion, reactVersion}
      copyTemplateDir(templateDir, targetDir, templateVars, err => {
        if (err) return cb(err)
        console.log(`nwb: created ${targetDir}`)
        console.log('nwb: installing dependencies')
        installReact(targetDir)
        cb()
      })
    })
  },

  [WEB_MODULE](args, name, targetDir, cb) {
    getWebModulePrefs(args, ({umd, globalVariable}) => {
      let templateDir = path.join(__dirname, `../../templates/${WEB_MODULE}`)
      let templateVars = {umd, globalVariable, name, nwbVersion}
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
