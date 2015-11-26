import {execSync} from 'child_process'
import path from 'path'

console.log('nwb: install')
execSync(['npm install'].concat(process.argv.slice(3)).join(' '), {
  cwd: path.join(__dirname, '..'),
  stdio: [0, 1, 2]
})
