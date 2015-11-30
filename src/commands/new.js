import path from 'path'
import {execSync} from 'child_process'

import copyTemplateDir from 'copy-template-dir'
import inquirer from 'inquirer'
import glob from 'glob'

import {
  REACT_APP, REACT_COMPONENT, REACT_VERSION as reactVersion, WEB_MODULE, MODULE_TYPES
} from '../constants'
import debug from '../debug'
import pkg from '../../package.json'

let nwbVersion = `~${pkg.version}`

function getWebModulePrefs(cb) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'globalVariable',
      message: `Which global variable will the UMD build export?`
    }
  ], cb)
}

function installReact(targetDir) {
  let command = `npm install react@${reactVersion} react-dom@${reactVersion}`
  debug(`${targetDir} $ ${command}`)
  execSync(command, {
    cwd: targetDir,
    stdio: [0, 1, 2]
  })
}

let moduleCreators = {
  [REACT_APP](name, targetDir) {
    let templateDir = path.join(__dirname, `../../templates/${REACT_APP}`)
    let templateVars = {name, nwbVersion, reactVersion}
    copyTemplateDir(templateDir, targetDir, templateVars, err => {
      if (err) {
        console.error(err.stack)
        process.exit(1)
      }
      console.log(`nwb: created ${targetDir}`)
      console.log('nwb: installing dependencies')
      installReact(targetDir)
    })
  },

  [REACT_COMPONENT](name, targetDir) {
    getWebModulePrefs(({globalVariable}) => {
      let templateDir = path.join(__dirname, `../../templates/${REACT_COMPONENT}`)
      let templateVars = {globalVariable, name, nwbVersion, reactVersion}
      copyTemplateDir(templateDir, targetDir, templateVars, err => {
        if (err) {
          console.error(err.stack)
          process.exit(1)
        }
        console.log(`nwb: created ${targetDir}`)
        console.log('nwb: installing dependencies')
        installReact(targetDir)
      })
    })
  },

  [WEB_MODULE](name, targetDir) {
    getWebModulePrefs(({globalVariable}) => {
      let templateDir = path.join(__dirname, `../../templates/${WEB_MODULE}`)
      let templateVars = {globalVariable, name, nwbVersion}
      copyTemplateDir(templateDir, targetDir, templateVars, err => {
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
  if (MODULE_TYPES.indexOf(moduleType) === -1) {
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
