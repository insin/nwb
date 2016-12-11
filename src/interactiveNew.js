import inquirer from 'inquirer'
import {PROJECT_TYPES} from './constants'

export default function interactiveNew_(args) {
  const prompts = [
    {
      type: 'list',
      name: 'projectType',
      message: 'Select a Project Type',
      choices: PROJECT_TYPES.map(type => {
        const displayName = type.replace('-', ' ').split(' ').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
        return {
          name: displayName,
          value: type
        }
      })
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter a Project Name',
      filter: input => input.split(' ').join('-')
    }
  ]
  return inquirer
    .prompt(prompts)
    .then(answers => Object.assign({}, args, answers))
}
