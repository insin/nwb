import karmaServer from '../karmaServer'

export default function testReact(args, cb) {
  karmaServer({
    babel: {
      presets: ['react']
    }
  }, args, cb)
}
