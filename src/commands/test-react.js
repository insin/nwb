import karmaServer from '../karmaServer'

export default function testReact(args, cb) {
  karmaServer(args, {
    babel: {
      presets: ['react']
    }
  }, cb)
}
