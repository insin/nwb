# Quick Development with nwb

Installing nwb globally provides commands for quickly running and building code using React or the React-like alternatives nwb also supports.

These quick development commands are:

- `react` for [React](https://facebook.github.io/react/)
- `inferno` for [Inferno](https://infernojs.org/)
- `preact` for [Preact](https://preactjs.com/)

They all have the same sub-commands:

- `run <entry.js>` runs a development server
- `build <entry.js> [dist/]` creates a build

> **Prerequisite:** nwb must be installed globally (we're using version 0.14 in this guide):
>
> ```
> npm install -g nwb
> ```

- [Example](#example)
- [Zero Configuration Development Setup](#zero-configuration-development-setup)
  - [Style Preprocessor Plugins](#style-preprocessor-plugins)
  - [Automatic Dependency Installation](#automatic-dependency-installation)
- [Configuration File (if you need it)](#configuration-file-if-you-need-it)
- [Entry Modules](#entry-modules)
  - [Export a Component](#export-a-component)
  - [Export an Element or VNode](#export-an-element-or-vnode)
  - [Handle Rendering Yourself](#handle-rendering-yourself)
- [React Alternatives Compatibility](#react-alternatives-compatibility)
  - [React Compatible Builds with `--inferno` or `--preact`](#react-compatible-builds-with---inferno-or---preact)
  - [Reusing React Modules](#reusing-react-modules)
- [Options for `run` and `build` commands](#options-for-run-and-build-commands)
  - [`run` Options](#run-options)
  - [`build` Options](#build-options)
- [Rendering Shims and Hot Module Replacement (HMR)](#rendering-shims-and-hot-module-replacement-hmr)
  - [Opting out of Rendering Shims with `--force`](#opting-out-of-rendering-shims-with---force)

## Example

Quick development commands are intended to reduce the time between having a flash of inspiration and being able to develop and build it.

Say you have an idea for a component and you whip up the following using Preact in `Lightbulb.js`:

```js
import {h, Component} from 'preact'

export default class Lightbulb extends Component {
  state = {
    on: false
  }
  render({wattage = 200}, {on}) {
    return <div>
      <label>
        <input type="checkbox" checked={on} onClick={this.linkState('on')}/>
        {' '}
        {wattage}W lightbulb is {on ? 'on' : 'off'}
      </label>
    </div>
  }
}
```

To serve this for development use `preact run`, which will install essential  dependencies, start a Webpack server and automatically re-render when you change `Lightbulb.js`:

```sh
$ preact run Lightbulb.js
✔ Installing preact and preact-compat
Starting Webpack compilation...
Compiled successfully in 3717 ms.

The app is running at http://localhost:3000/
```

To create a production-ready build, use `preact build`:

```sh
$ preact build Lightbulb.js
✔ Building Preact app

File size after gzip:

  dist\app.b12334ec.js  8.63 KB
```

## Zero Configuration Development Setup

nwb generates a comprehensive default configuration for developing apps using Babel and Webpack.

Without any configuration, the default features you get are the same as when using the `nwb` command for project development:

- Write JavaScript with ES6/ES2015 and JSX transpiled down to ES5.
- Use new JavaScript features which are at Stage 2 and above in the TC39 process:
  - `async`/`await` syntax, for writing async code in a synchronous way.
  - Class properties, for avoiding boilerplate when writing ES6 classes.
  - Decorators.
  - Object rest/spread, for shallow cloning, merging and partially destructuring objects as syntax.
- Polyfills for  `Promise`,  `fetch()` and `Object.assign()`.
- Import stylesheets (and font resources), images and JSON into JavaScript, to be handled by Webpack.
- Autoprefixed CSS, so you don't need to write browser prefixes.

For quick development commands, nwb also enables Babel's Stage 0 features by default, allowing you to use the following:

- [`do` expressions](http://babeljs.io/docs/plugins/transform-do-expressions/#detail)
- [`::` function binding operator](http://babeljs.io/docs/plugins/transform-function-bind/#detail)
- [export extensions](http://babeljs.io/docs/plugins/transform-export-extensions/#example)

> Note: these features are considered highly experimental, so consider that before writing anything more than a prototype which depends on them!

Fallback serving of `index.html` at any URL is also enabled by default so apps which use the HTML5 History API will work by default.

### Style Preprocessor Plugins

nwb supports plugin modules which add [Sass](https://github.com/insin/nwb-sass), [Less](https://github.com/insin/nwb-less) and [Stylus](https://github.com/insin/nwb-stylus) support without needing configuration.

To use them, pass a `--plugins` option with a plugin name (or a comma-separated list of names, if you're so inclined), with or without its `nwb-` prefix.

e.g. to add support for importing an `.scss` stylesheet into the Lightbulb example above, run it like this:

```sh
preact run Lightbulb.js --plugins sass
```

### Automatic Dependency Installation

Having to stop and restart your server to install new dependencies or use a pair of shells in the same directory to do so is a minor annoyance when you're just looking to bang out some initial code.

If you pass an `--install` flag when using the `run` subcommmand, nwb will configure [`NpmInstallPlugin`](https://github.com/ericclemmons/npm-install-webpack-plugin) to automatically install missing dependencies when an attempt is made to import them.

> Note: `NpmInstallPlugin` uses a `package.json` file while checking which packages are installed, so it will initialise one the first time you use this command and save any automatically-installed dependencies to it.

## Configuration File (if you need it)

nwb supports use of a [configuration file](/docs/Configuration.md#configuration) - it's not required for quick devlopment commands, but if you need some tweaks on top of the default setup (e.g. to [enable CSS modules](/docs/FAQ.md#how-do-i-enable-css-modules)) you can make use of it.

nwb will automatically use an `nwb.config.js` if present the working directory, or you can specify a custom file with the `--config` option.

## Entry Modules

Supported ways of writing your entry module are:

### Export a Component

As shown above, you can export a component and it will be rendered:

```js
import React from 'react'

export default class App extends React.Component {
  render() {
    return <div>
      <h1>Idea!</h1>
    </div>
  }
}
```

### Export an Element or VNode

You can also directly export an Element (React terminology) or VNode (Inferno and Preact equivalent) and it will be rendered:

```js
import Inferno from 'inferno'

export default <div>
  <h1>Idea!</h1>
</div>
```
```sh
$ inferno run idea.js
✔ Installing inferno, inferno-component and inferno-compat
Starting Webpack compilation...
Compiled successfully in 3595 ms.

The app is running at http://localhost:3000/
```

### Handle Rendering Yourself

If you're handling rendering yourself, you shouldn't export anything:

```js
import React from 'react'
import {render} from 'react-dom'

let App = React.createClass({
  render() {
    return <h1>Hello world!</h1>
  }
})

render(<App/>, document.getElementById('app'))
```

The default HTML template contains a `<div id="app">` element to render into - you can change the `id` using the `--mount-id` option.

> Note: if you're manually rendering Inferno or Preact, you don't have to specify a target DOM node. See [Rendering Shims and Hot Module Replacement](#rendering-shims-and-hot-module-replacement) below for details.

## React Alternatives Compatibility

Inferno and Preact both provide compatibility layers which simulate React APIs and patch up features which are different or missing compared to React, to allow them to run existing React code.

### React Compatible Builds with `--inferno` or `--preact`

To try these out with some React code you've written, you can pass an `--inferno` flag for a build which uses [`inferno-compat`](https://infernojs.org/docs/guides/switching-to-inferno) or a `--preact` flag for a build which uses [`preact-compat`](https://preactjs.com/guide/switching-to-preact).

If your code is compatible, these builds offer a way to take a large chunk off the size of the final bundle, and may even provide a performance boost.

```sh
$ react build hello.js
✔ Building React app

File size after gzip:

  dist\app.e718700a.js  46.5 KB
```
```sh
$ react build hello.js --preact
✔ Installing preact and preact-compat
✔ Cleaning app
✔ Building Preact (React compat) app

File size after gzip:

  dist\app.d786be80.js  12.86 KB
```

### Reusing React Modules

The `inferno` and `preact` commands are configured to use their compatibility layer for any React code which is imported - you'll only pay the cost of including the compatibility layer in your bundle if you import something which uses React.

e.g. if you want a live "time ago" component for your Inferno app, you can pull `react-timeago` in:

```js
import Inferno from 'inferno'
import TimeAgo from 'react-timeago'

let date = new Date()

export default function App() {
  return <div>
    This was rendered <TimeAgo date={date}/>
  </div>
}
```

## Options for `run` and `build` commands

### Shared options

#### `-c, --config`

Specify a configuration file to use - see [Configuration File](#configuration-file-if-you-need-it).

#### `-p, --plugins`

Specify nwb plugins to use - see [Style Preprocessor Plugins](#style-preprocessor-plugins).

#### `--force`

Don't use a rendering shim, run the provided entry module directly - see [Opting out of Rendering Shims](#opting-out-of-rendering-shims-with---force).

#### `--mount-id`

The default HTML template provided contains a `<div>` which the app is rendered into, with a default `id` of `'app'`. You can change the `id` with this setting.

#### `--no-polyfill`

Disable inclusion of nwb's default polyfills for `Promise`, `fetch()` and `Object.assign()` - you can use this to shave a few KB off the final bundle size if you're not using these features or are only supporting browsers which support them natively.

#### `--title`

Contents for `<title>` - defaults to the type of app you're serving.

### `run` Options

#### `--install`

Use [`NpmInstallPlugin`](https://github.com/ericclemmons/npm-install-webpack-plugin) to automatically install missing dependencies when an attempt is made to import them - see [Automatic Dependency Installation](#automatic-dependency-installation).

#### `--host`

Host to run the development server on. This is omitted by default, so the server will accept connections on any address.

#### `--no-fallback`

Disables the default fallback serving of `index.html` for apps which make use of the HTML5 History API.

#### `--port`

Port to run the dev server on (default: 3000)

#### `--reload`

Automatically refresh the page when an HMR request was not accepted.

---

### `build` Options

#### `--vendor`

Enable extraction of modules imported from `node_modules/` into a separate `vendor` bundle.

#### `--inferno`
#### `--preact`

> These options only apply to React builds

Create a build of some React code which uses Inferno or Preact as the runtime via compatibility layer - see [React Compatible Builds](#react-compatible-builds-with---inferno-or---preact).

### Rendering Shims and Hot Module Replacement (HMR)

> [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) (HMR) is a Webpack feature which allows you to patch live code changes into your running app.

To support rendering when an entry module exports a Component, React Element or Inferno/Preact VNode, a rendering shim is used by default.

When the rendering shim detects that one of these has been exported from the provided entry module, it will handle the initial render and, where possible, will also accept HMR requests and handle re-render.

**React**

`react run`'s build configuration uses [react-transform-hmr](https://github.com/gaearon/react-transform-hmr), which automatically handles accepting HMR requests in modules which contain React components, patching them and re-rendering without losing state where possible.

For other HMR scenarios, such as an exported React Element, `react run` will re-render to the same root DOM node.

**Inferno and Preact**

The rendering shim for `inferno run` and `preact run` hooks into the DOM rendering function of these librares so it can accept HMR requests and re-render to the same root element when you change the code.

This means that if you import and call `render()` yourself, the rendering shim is still taking the VNode you pass it and handling rendering for you, so you don't need to provide a DOM node to render into.

#### Opting out of Rendering Shims with `--force`

If you don't want to use a rendering shim, pass a `--force` flag the module you provide will be used as the entry point ant you'll beresponsible for rendering your app to the DOM.

You will also need to manually deal with HMR for Inferno and Preact if you want it , as they don't currently have equivalents of React Hot Loader, which does HMR at the component level.
