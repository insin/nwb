import path from 'path'

import glob from 'glob'

import createProject, {validateProjectType} from '../createProject'
import {UserError} from '../errors'
import interactiveNew from '../interactiveNew'

export default function new_(args, cb) {
  Promise.resolve()
  .then(() => {
    if (args._.length > 1) {
      return Object.assign({}, args._, {
        projectType: args._[1],
        projectName: args._[2]
      })
    }
    return interactiveNew(args)
  }).then(options => {
    const { projectName, projectType } = options
    try {
      validateProjectType(projectType)
    }
    catch (e) {
      return cb(e)
    }
    if (!projectName) {
      return cb(new UserError('A project name must be provided'))
    }
    if (glob.sync(`${projectName}/`).length !== 0) {
      return cb(new UserError(`A ${projectName}/ directory already exists`))
    }

    let targetDir = path.resolve(projectName)
    let initialVowel = /^[aeiou]/.test(projectType)

    console.log(`Creating ${initialVowel ? 'an' : 'a'} ${projectType} project...`)
    createProject(args, projectType, projectName, targetDir, cb)
  }).catch(e => new UserError(e))
}
