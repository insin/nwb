import karmaServer from '../karmaServer'

export default function testPreact(args, cb) {
  karmaServer({
    babel: {
      presets: ['preact']
    }
  }, args, cb)
}
