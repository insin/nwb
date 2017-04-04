import karmaServer from '../karmaServer'

export default function testPreact(args, cb) {
  karmaServer(args, {
    babel: {
      presets: ['preact']
    }
  }, cb)
}
