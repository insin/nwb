import path from 'path'

import glob from 'glob'

const DEFAULT_HTML_PATH = 'src/index.html'

export function getDefaultHTMLConfig(cwd = process.cwd()) {
  // Use the default HTML template path if it exists
  if (glob.sync(DEFAULT_HTML_PATH, {cwd}).length > 0) {
    return {
      template: DEFAULT_HTML_PATH,
    }
  }
  // Otherwise provide default variables for the internal template, in case we
  // fall back to it.
  return {
    mountId: 'app',
    title: require(path.join(cwd, 'package.json')).name,
  }
}
