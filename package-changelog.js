/**
 * Generates changelog Markdown for pinned npm packages in a package.json diff
 *
 * Usage: git diff package.json | node package-changelog.js
 */

let fs = require('fs')

let changes = fs.readFileSync(0, 'utf-8')

let re = /^(?<change>[+-])\s*"(?<pkg>[^"]+)"\s*:\s*"(?<version>\d+\.\d+\.\d+)"/gm

let deps = new Map()

Array.from(changes.matchAll(re)).forEach(({groups}) => {
  if (!deps.has(groups.pkg)) {
    deps.set(groups.pkg, {})
  }
  deps.get(groups.pkg)[groups.change] = groups.version
})

let changelog = Array.from(deps.keys())
  .sort()
  .map((pkg) => {
    let versions = deps.get(pkg)
    if (!versions.hasOwnProperty('-')) {
      return `- ${pkg}: v${versions['+']}`
    }
    return `- ${pkg}: v${versions['-']} → [v${versions['+']}]()`
  })
  .join('\n')

console.log(changelog)
