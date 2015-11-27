import path from 'path'
import {execSync} from 'child_process'

import copyTemplateDir from 'copy-template-dir'
import inquirer from 'inquirer'
import glob from 'glob'

import {REACT_APP, REACT_COMPONENT, REACT_VERSION, WEB_MODULE, MODULE_TYPES} from '../constants'
import pkg from '../../package.json'

function getWebModulePrefs(cb) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'globalVariable',
      message: `Which global variable will the UMD build export?`
    }
  ], cb)
}

let moduleCreators = {
  [REACT_APP](name, targetDir) {
    let templateDir = path.join(__dirname, `../../templates/${REACT_APP}`)
    copyTemplateDir(templateDir, targetDir, {
      name,
      nwbVersion: `~${pkg.version}`,
      reactVersion: REACT_VERSION
    }, err => {
      if (err) {
        console.error(err.stack)
        process.exit(1)
      }
      console.log(`nwb: created ${targetDir}`)
      console.log('nwb: installing dependencies')
      execSync(`npm install react@${REACT_VERSION} react-dom@${REACT_VERSION}`, {
        cwd: targetDir,
        stdio: [0, 1, 2]
      })
    })
  },

  [REACT_COMPONENT](name, targetDir) {
    getWebModulePrefs(({globalVariable}) => {
      let templateDir = path.join(__dirname, `../../templates/${REACT_COMPONENT}`)
      copyTemplateDir(templateDir, targetDir, {
        globalVariable,
        name,
        nwbVersion: `~${pkg.version}`,
        reactVersion: REACT_VERSION
      }, err => {
        if (err) {
          console.error(err.stack)
          process.exit(1)
        }
        console.log(`nwb: created ${targetDir}`)
        console.log('nwb: installing dependencies')
        execSync(`npm install react@${REACT_VERSION} react-dom@${REACT_VERSION}`, {
          cwd: targetDir,
          stdio: [0, 1, 2]
        })
      })
    })
  },

  [WEB_MODULE](name, targetDir) {
    getWebModulePrefs(({globalVariable}) => {
      let templateDir = path.join(__dirname, `../../templates/${WEB_MODULE}`)
      copyTemplateDir(templateDir, targetDir, {
        globalVariable,
        name,
        nwbVersion: `~${pkg.version}`
      }, err => {
        if (err) {
          console.error(err.stack)
          process.exit(1)
        }
        console.log(`nwb: created ${targetDir}`)
      })
    })
  }
}

export default function(args) {
  if (args._.length === 1) {
    console.log(`usage: nwb new [${MODULE_TYPES.join('|')}] <name>`)
    process.exit(0)
  }

  let moduleType = args._[1]
  if (!moduleType) {
    console.error(`nwb: a module type must be provided, one of: ${MODULE_TYPES.join(', ')}`)
    process.exit(1)
  }
  if (!(moduleType in MODULE_TYPES)) {
    console.error(`nwb: module type must be one of: ${MODULE_TYPES.join(', ')}`)
    process.exit(1)
  }

  let name = args._[2]
  if (!name) {
    console.error(`nwb: a module name must be provided`)
    process.exit(1)
  }
  if (glob.sync(`${name}/`).length !== 0) {
    console.error(`nwb: a ${name} directory already exists`)
    process.exit(1)
  }

  let targetDir = path.join(process.cwd(), name)
  moduleCreators[moduleType](name, targetDir)
}
