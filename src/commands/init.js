import path from 'path'

import {PROJECT_TYPES} from '../constants'
import createProject, {validateProjectType} from '../createProject'
import {UserError} from '../errors'

export default function(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError(`usage: nwb init [${PROJECT_TYPES.join('|')}] [name]`))
  }

  let [projectType, templateDir] = args._[1].split(':')
  try {
    validateProjectType(projectType)
  }
  catch (e) {
    return cb(e)
  }

  let name = args._[2]
  if (!name) {
    name = path.basename(process.cwd())
  }

  console.log(`nwb: init ${projectType}`)
  createProject(args, projectType, templateDir, name, process.cwd(), cb)
}
