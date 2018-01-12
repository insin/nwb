import path from 'path'

import {PROJECT_TYPES} from '../constants'
import createProject, {validateProjectType} from '../createProject'
import {UserError} from '../errors'
import {directoryExists} from '../utils'

export default function new_(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError(`usage: nwb new [${Array.from(PROJECT_TYPES).join('|')}] <name>`))
  }

  let projectType = args._[1]
  try {
    validateProjectType(projectType)
  }
  catch (e) {
    return cb(e)
  }

  let name = args._[2]
  if (!name) {
    return cb(new UserError('A project name must be provided'))
  }
  if (directoryExists(name)) {
    return cb(new UserError(`A ${name}/ directory already exists`))
  }

  let targetDir = path.resolve(name)
  let initialVowel = /^[aeiou]/.test(projectType)
  console.log(`Creating ${initialVowel ? 'an' : 'a'} ${projectType} project...`)
  createProject(args, projectType, name, targetDir, cb)
}
