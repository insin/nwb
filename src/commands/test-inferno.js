import karmaServer from '../karmaServer'

export default function testInferno(args, cb) {
  karmaServer({
    babel: {
      presets: ['inferno']
    }
  }, args, cb)
}
