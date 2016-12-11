import {clean} from '../utils'

export default function cleanDemo(args, cb) {
  clean('demo', ['demo/dist'], cb)
}
