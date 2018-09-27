# Quick Development with nwb

> **Prerequisite:** nwb must be installed globally (we're using version 0.18 in this guide):
>
> ```
> npm install -g nwb
> ```

Quick development commands reduce the time between having a flash of inspiration and being able to develop and share it.

They are:

- `nwb react` for [React](https://facebook.github.io/react/) code
- `nwb inferno` for [Inferno](https://infernojs.org/) code
- `nwb preact` for [Preact](https://preactjs.com/) code
- `nwb web` for vanilla JavaScript code

They all have the same sub-commands:

- `run <entry.js>` runs a development server
- `build <entry.js> [dist/]` creates a production build

## Example


Say you have an idea for a Preact component and you whip up `Lightbulb.js`:

```js
import {h, Component} from 'preact'

export default class Lightbulb extends Component {
  state = {
    on: false
  }
  updateChecked = (e) => {
    this.setState({on: e.target.checked})
  }
  render({wattage = 200}, {on}) {
    return <div>
      <label>
        <input type="checkbox" checked={on} onClick={this.updateChecked}/>
        {' '}
        {wattage}W lightbulb is {on ? 'on' : 'off'}
      </label>
    </div>
  }
}
```

To serve this for development use `nwb preact run`, which will install essential dependencies, start a Webpack development server and automatically re-render when you make changes:

```sh
$ nwb preact run Lightbulb.js
✔ Installing preact and preact-compat
Starting Webpack compilation...
Compiled successfully in 3717 ms.

The app is running at http://localhost:3000/
```

To create a production build, use `nwb preact build`:

```sh
$ nwb preact build Lightbulb.js
✔ Building Preact app

File size after gzip:

  dist\app.b12334ec.js  8.63 KB
```

---

### Table of Contents

- [Options for `run` and `build` commands](#options-for-run-and-build-commands)
  - [Shared Options](#shared-options)
  - [`run` Options](#run-options)
  - [`build` Options](#build-options)
- [Features](#features)
  - [Zero Configuration Setup](#zero-configuration-setup)
  - [Style Preprocessing](#style-preprocessing)
  - [Automatic Dependency Installation](#automatic-dependency-installation)
  - [Making use of React Alternatives' Compatibility with React](#making-use-of-react-alternatives-compatibility-with-react)
    - [React Compatible Builds with `--inferno` or `--preact`](#react-compatible-builds-with---inferno-or---preact)
    - [Reusing React Modules](#reusing-react-modules)
  - [Rendering the Entry Module](#rendering-the-entry-module)
    - [Export a Component](#export-a-component)
    - [Export an Element or VNode](#export-an-element-or-vnode)
    - [Handle Rendering Yourself](#handle-rendering-yourself)
  - [Rendering Shims and Hot Module Replacement (HMR)](#rendering-shims-and-hot-module-replacement-hmr)
    - [React Rendering Shim](#react-rendering-shim)
    - [Inferno and Preact Rendering Shims](#inferno-and-preact-rendering-shims)
    - [Opting out of Rendering Shims with `--force`](#opting-out-of-rendering-shims-with---force)
- [Configuration](#configuration)
  - [Configuration Arguments](#configuration-arguments)
  - [Configuration File](#configuration-file)

---

## Options for `run` and `build` commands

### Shared options

#### `-c, --config`

Specify a configuration file to use - see [Configuration File](#configuration-file-if-you-need-it).

#### `-p, --plugins`

Specify nwb plugins to use - see [Style Preprocessing](#style-preprocessing).

#### `--force`

Don't use a rendering shim, run the provided entry module directly - see [Opting out of Rendering Shims](#opting-out-of-rendering-shims-with---force).

#### `--mount-id`

The default HTML template provided contains a `<div>` which the app is rendered into, with a default `id` of `'app'`. You can change the `id` with this setting.

#### `--no-polyfill`

Disable inclusion of nwb's default polyfills for `Promise`, `fetch()` and `Object.assign()` - you can use this to shave a few KB off the final bundle size if you're not using these features, are only supporting browsers which support them natively, or would prefer to provide your own polyfills, etc.

#### `--title`

Contents for `<title>` - defaults to the type of app you're serving, e.g. `'Preact App'`

### `run` Options

#### `--install`

Use [`NpmInstallPlugin`](https://github.com/webpack-contrib/npm-install-webpack-plugin) to automatically install missing dependencies when an attempt is made to import them - see [Automatic Dependency Installation](#automatic-dependency-installation).

#### `--host`

Configures the host the development server will bind to.

#### `--no-clear`

Disables clearing the console before displaying Webpack compilation results - nwb clears the console by default to make it easier to read error messages without having to scroll back.

#### `--no-fallback`

Disables the default fallback serving of `index.html` for apps which make use of the HTML5 History API.

#### `--port`

Port to run the dev server on (default: `3000`)

#### `--reload`

Automatically refresh the page when a Hot Module Replacement request was not accepted.

> **Note:** `nwb web run` defaults this setting to `true` will reload the page by default on changes. To disable this, use a `--no-reload` flag or use Webpack's [Hot Module Replacement API](https://webpack.js.org/api/hot-module-replacement/) in your app to accept module updates.

### `build` Options

#### `--vendor`

Enable extraction of modules imported from `node_modules/` into a separate `vendor` bundle.

#### `--inferno[-compat]`
#### `--preact[-compat]`

> These options only apply to `nwb react build`

Create a build of a React project which uses Inferno or Preact as the runtime via a compatibility layer - see [React Compatible Builds](#react-compatible-builds-with---inferno-or---preact).

## Features

### Zero Configuration Setup

- Write JavaScript with ES2015-ES2017 features and JSX, transpiled down to ES5.
- Use new JavaScript features at Stage 2 and above in the TC39 process:
  - [`async`/`await` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), for writing async code in a synchronous way.
  - Class properties, for avoiding boilerplate when writing ES2015 classes.
  - Decorators.
  - [Object rest/spread](https://github.com/sebmarkbage/ecmascript-rest-spread#object-restspread-properties-for-ecmascript), for shallow cloning, merging and partially destructuring objects as syntax.

- Use experimental JavaScript feature proposals which are at Stages 0 and 1 in the TC39 process:
  - [export extensions](http://babeljs.io/docs/plugins/transform-export-extensions/#example)
  - [`do` expressions](http://babeljs.io/docs/plugins/transform-do-expressions/#detail)
  - [`::` function binding operator](http://babeljs.io/docs/plugins/transform-function-bind/#detail)

- Polyfills for `Promise`,  `fetch()` and `Object.assign()`, which can be disabled with a `--no-polyfill` flag if you don’t need them or want to provide your own.
- Import images and stylesheets into JavaScript like any other module, to be handled by Webpack as part of its build.

  ```js
  import 'bootstrap/dist/css/bootstrap.css'

  <img src={require('./picture.jpg')}/>
  ```

- Autoprefixed CSS, so you don't need to write browser prefixes.
- Fallback serving of `index.html` at any URL so apps which use the [HTML5 History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries) will work by default.

### Style Preprocessing

nwb has plugin modules which add [Sass](https://github.com/insin/nwb-sass) (`nwb-sass`), [Less](https://github.com/insin/nwb-less) (`nwb-less`) and [Stylus](https://github.com/insin/nwb-stylus) (`nwb-stylus`) support without needing configuration.

To use them, pass a `--plugins` option with an nwb plugin name (or a comma-separated list of names), with or without its `nwb-` prefix.

e.g. to support importing Sass stylesheets, pass `--plugins sass` and the necessary plugin will automatically be installed and used:

```sh
$ nwb preact run Lightbulb.js --plugins sass
✔ Installing nwb-sass
Starting Webpack compilation...
```

### Automatic Dependency Installation

Having to stop and restart your development server to install new dependencies becomes a minor annoyance when you're in the middle of writing code.

If you pass an `--install` flag to the `run` command, nwb will configure [`NpmInstallPlugin`](https://github.com/webpack-contrib/npm-install-webpack-plugin) to automatically install missing dependencies when an attempt is made to import them.

```sh
$ nwb preact run Lightbulb.js --install
Starting Webpack compilation...
```

Now if we add the following to the top of `Lightbulb.js`:

```js
import 'bootstrap/dist/css/bootstrap.css'
```

[Bootstrap](https://getbootstrap.com/) will be installed and applied to the running app:

```sh
Recompiling...
Installing bootstrap...
```

### Making use of React Alternatives' Compatibility with React

Inferno and Preact both provide compatibility layers which simulate React APIs and patch up features which are different or missing compared to React, to allow them to run existing React code.

#### React Compatible Builds with `--inferno` or `--preact`

To try this out with some React code you've written, you can pass an `--inferno` flag for a build which uses [`inferno-compat`](https://infernojs.org/docs/guides/switching-to-inferno) or a `--preact` flag for a build which uses [`preact-compat`](https://preactjs.com/guide/switching-to-preact).

If your code is compatible, these builds offer an easy way to take a large chunk off the size of the final bundle, and may even provide a performance boost.

```sh
$ nwb react build hello.js
✔ Building React app

File size after gzip:

  dist\app.e718700a.js  46.5 KB
```
```sh
$ nwb react build hello.js --preact
✔ Installing preact and preact-compat
✔ Cleaning app
✔ Building Preact (React compat) app

File size after gzip:

  dist\app.d786be80.js  12.86 KB
```

#### Reusing React Modules

The `inferno` and `preact` commands are configured to use their respective compatibility layer for any React code which is imported - you'll only pay the cost of including the compatibility layer in your bundle if you import something which uses React.

e.g. if you want a live "time ago" component for your Inferno app, you can pull [`react-timeago`](https://github.com/nmn/react-timeago) in:

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

### Rendering the Entry Module

> This section doesn't apply to the `nwb web` command, as you're in charge of rendering and using Hot Module Replacement in a vanilla JavaScript app.

Quick development commands can take care of the boilerplate for rendering and handling top-level Hot Module Replacement for React, Preact and Inferno.

Take advantage of this by writing the entry module you provide in the following ways:

#### Export a Component

You can export a component and it will be rendered:

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

#### Export an Element or VNode

You can directly export an Element (React terminology) or VNode (Inferno and Preact equivalent) and it will be rendered:

```js
import Inferno from 'inferno'

export default <div>
  <h1>Idea!</h1>
</div>
```
```sh
$ nwb inferno run idea.js
✔ Installing inferno, inferno-component and inferno-compat
Starting Webpack compilation...
Compiled successfully in 3595 ms.

The app is running at http://localhost:3000/
```

#### Handle Rendering Yourself

If you're handling the initial `render()` call yourself, you don't need to provide a target DOM node, as nwb hooks into the `render()` method so it can keep handling top-level Hot Module Replacement for you.

nwb will use lack of exports from an entry module as indication that you're handling rendering yourself:

```js
import React from 'react'
import {render} from 'react-dom'

class App extends React.Component {
  render() {
    return <h1>Hello world!</h1>
  }
}

render(<App/>, document.getElementById('app'))
```

### Rendering Shims and Hot Module Replacement (HMR)

> [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) (HMR) is a Webpack feature which enables patching code changes into a running app.

To support rendering when an entry module exports a Component, React Element or Inferno/Preact VNode, a rendering shim is used by default.

When the rendering shim detects that one of these has been exported from the provided entry module, it will handle the initial render and, where possible, will also accept HMR requests and handle re-render.

#### React Rendering Shim

`nwb react run`'s build configuration uses [react-transform-hmr](https://github.com/gaearon/react-transform-hmr), which automatically handles accepting HMR requests in modules which contain React components, patching them and re-rendering without losing state where possible.

> To disable this, pass a `--no-hmre` flag.

For other HMR scenarios, such as an exported React Element, `nwb react run`'s rendering shim will re-render to the same root DOM node.

#### Opting out of Rendering Shims with `--force`

If you don't want to use a rendering shim, pass a `--force` flag the module you provide will be used as the entry point and you'll be responsible for rendering your app to the DOM.

You will also need to manually deal with HMR for Inferno and Preact if you want it, as they don't currently have equivalents of React Hot Loader, which does HMR at the component level.

## Configuration

nwb supports [configuration](/docs/Configuration.md#configuration) when you need it.

### Configuration Arguments

For quick tweaks, you can pass [configuration arguments](/docs/Configuration.md#configuration-arguments) using dotted paths to set any of the documented configuration properties.

e.g. to [enable CSS modules](/docs/FAQ.md#how-do-i-enable-css-modules) for imported `.css` stylesheets:

```sh
$ nwb react run app.js --webpack.rules.css.modules
```

e.g. to use a [Babel plugin](https://github.com/insin/babel-plugin-react-html-attrs) which allows you to use `class` and `for` attributes in React JSX:

```sh
$ nwb react run app.js --babel.plugins=react-html-attrs
```

### Configuration File

To make configuration tweaks permanent, you can put them in a [configuration file](/docs/Configuration.md#configuration-file).

nwb will automatically use an `nwb.config.js` if present the working directory, or you can specify a custom file with a `--config` option.
