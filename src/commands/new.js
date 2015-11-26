import path from 'path'
import {execSync} from 'child_process'

import copyTemplateDir from 'copy-template-dir'
import glob from 'glob'

import pkg from '../../package.json'

export default function(args) {
  let [cmd, moduleType, name] = args._
  if (!moduleType) {
    console.error(`${cmd}: a module type must be provided, one of: ${Object.keys(MODULE_TYPES).join(', ')}`)
    process.exit(1)
  }
  if (!(moduleType in MODULE_TYPES)) {
    console.error(`${cmd}: module type must be one of: ${Object.keys(MODULE_TYPES).join(', ')}`)
    process.exit(1)
  }
  if (!name) {
    console.error(`${cmd}: a module name must be provided`)
    process.exit(1)
  }
  if (glob.sync(`${name}/`).length !== 0) {
    console.error(`${cmd}: a ${name} directory already exists`)
    process.exit(1)
  }

  let targetDir = path.join(process.cwd(), name)
  MODULE_TYPES[moduleType](name, targetDir)
}

const MODULE_TYPES = {
  'module': function(name, targetDir, cb) {
    let templateDir = path.join(__dirname, '../../templates/module')
    copyTemplateDir(templateDir, targetDir, {
      name,
      nwbVersion: pkg.version
    }, err => {
      if (err) {
        console.error(err.stack)
        process.exit(1)
      }
      console.log(`nwb: created ${targetDir}`)
    })
  },

  'react-app': function(name, targetDir, cb) {
    let templateDir = path.join(__dirname, '../../templates/react-app')
    copyTemplateDir(templateDir, targetDir, {
      name,
      nwbVersion: pkg.version,
      reactVersion: '^0.14.0'
    }, err => {
      if (err) {
        console.error(err.stack)
        process.exit(1)
      }
      console.log(`nwb: created ${targetDir}`)
      console.log(`nwb: installing dependencies`)
      execSync('npm install --production', {cwd: targetDir, stdio: [0, 1, 2]})
    })
  }
}
