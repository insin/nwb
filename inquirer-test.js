var inquirer = require('inquirer')

function init(config) {
  console.log(config)
}

inquirer.prompt([
  {
    type: 'checkbox',
    name: 'babelStage',
    message: 'Babel 5.x experimental ES7 proposal support:',
    choices: [
      {name: 'Stage 3 (asyncFunctions)'},
      {name: 'Stage 2 (exponentiationOperator, objectRestSpread)', checked: true},
      {name: 'Stage 1 (decorators, exportExtensions, trailingFunctionCommas)'},
      {name: 'Stage 0 (comprehensions, classProperties, doExpressions, functionBind)'}
    ]
  },
  {
    type: 'confirm',
    name: 'babelLoose',
    message: 'Use Babel loose mode?',
    default: true
  },
  {
    type: 'checkbox',
    name: 'style',
    message: 'How will you be styling your app?',
    choices: [
      {name: 'CSS', checked: true},
      {name: 'Less'},
      {name: 'Sass'},
      {name: 'Stylus'}
    ],
    default: 0
  },
  {
    type: 'list',
    name: 'testing',
    message: 'Which testing framework will you use?',
    choices: [
      'Mocha',
      'Tape'
    ],
    default: 0
  }
], function(config) {
  var extras = []
  if (config.style === 'CSS') {
    extras.push({
      type: 'confirm',
      name: 'css-modules',
      message: 'Will you be using CSS Modules?',
      default: false
    })
  }
  if (config.testing === 'Mocha') {
    extras.push({
      type: 'list',
      name: 'assertion',
      message: 'Which assertion library will you use?',
      choices: [
        'assert',
        'chai + chai-jsx',
        'expect + expect-jsx'
      ],
      default: 0
    })
  }
  if (extras.length !== 0) {
    inquirer.prompt(extras, function(extraConfig) {
      init(Object.assign(config, extraConfig))
    })
  }
  else {
    init(config)
  }
})
