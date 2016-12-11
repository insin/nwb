import {clean} from '../utils'

export default function cleanModule(args, cb) {
  clean('module', ['coverage', 'es', 'lib', 'umd'], cb)
}
