// @flow
import merge from 'webpack-merge'

import karmaServer from '../karmaServer'
import reactConfig from '../react'

import type {ErrBack} from '../types'

export default function testReactComponent(args: Object, cb: ErrBack) {
  karmaServer(args, merge(reactConfig(args).getKarmaTestConfig(), {}), cb)
}
