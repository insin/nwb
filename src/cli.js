import parseArgs from 'minimist'

import pkg from '../package.json'

export default function(argv, cb) {
  let args = parseArgs(argv, {
    alias: {
      h: 'help',
      v: 'version'
    },
    boolean: ['help', 'version']
  })

  if (args.version) {
    console.log(`v${pkg.version}`)
    process.exit(0)
  }

  if (args.help || args._.length === 0) {
    console.log(`
  Usage: nwb <command>

  Options:
    -h, --help     display this help message
    -v, --version  print nwb's version

  Project creation commands:
    new react-app <name>        create a React app
    new react-component <name>  create a React component module with a demo app
    new web-app <name>          create a web app
    new web-module <name>       create a web module
                                -f, --force  force creation, no questions
                                -g, --global global variable for npm UMD build
                                --no-jsnext  disable npm ES6 modules build
                                --no-umd     disable npm UMD module build

  Development commands:
    build          clean and build
    clean          delete build
    test           run tests
                     --coverage  create code coverage report
                     --server    keep running tests on every change
    serve          serve an app, or a component's demo app, with hot reloading
                     --fallback  serve the index page from any path
                     --info      show webpack module info
                     --port      port to run the dev server on [3000]
                     --reload    auto-reload the page if hot reloading fails
  `)
    process.exit(args.help ? 0 : 1)
  }

  let command = args._[0]

  let unknownCommand = () => {
    console.error(`nwb: unknown command: ${command}`)
    process.exit(1)
  }

  // Validate the command is in foo-bar-baz format before trying to resolve a
  // module path with it.
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(command)) {
    unknownCommand()
  }

  let commandModulePath
  try {
    commandModulePath = require.resolve(`./commands/${command}`)
  }
  catch (e) {
    unknownCommand()
  }

  let commandModule = require(commandModulePath)
  if (commandModule.default) {
    commandModule = commandModule.default
  }
  commandModule(args, cb)
}
