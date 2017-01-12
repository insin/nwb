import karmaServer from '../karmaServer'

export default function testInferno(args, cb) {
  karmaServer(args, {
    babel: {
      presets: ['inferno']
    }
  }, cb)
}
