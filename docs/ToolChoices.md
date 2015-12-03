## Tool Choices

**Package management** - [npm](https://www.npmjs.com) for everything, that's why it's in the name. npm is for client modules too.

**Transpiler** - we need a transpiler for [JSX](http://facebook.github.io/jsx/); we had to set up a build for that, so we might as well use ES6 features too; oh look, it also supports some experimental feature proposals; ...; we can't ever go back!

This is the [Babel](http://babeljs.io/) via React experience. nwb currently uses version 5 of Babel, which is no longer actively supported, but has everything we need bundled right out of the box, and more importantly - hot reloading tools for React are still catching up with Babel 6.

**Module bundler** - we need to take our source code and do all sorts of things with it: transpiling it, bundling it up, splitting it into different chunks based on who made it or when it needs to be loaded, hot reloading it. minifying it, adding banner comments to it and more.

It would also be nice if we also had a common way to manage the CSS and image dependencies both we and our dependencies have.

nwb uses [Webpack](https://webpack.github.io/) for this, which plays a key part in making configurable builds manageable.

**Test runner** - since we're writing code which will run in web browsers, we want to run our tests in them. Make that multiple browsers. And we want to re-run the tests every time they change. And we need to use our module bundler and transpiler to make the code runnable. And we want to instrument the code for various reasons.

[Karma](http://karma-runner.github.io) will do just fine. It's configured to use [PhantomJS](http://phantomjs.org/) by default.

### "Defaults, we need defaults"

Since we want to...

1. Provide project templates with tests which can be run right out of the box
1. Provide default testing tools so you don't *have* to make a choice when you're just getting started

...we need to make some other choices.

[These can be configured](/docs/Configuration.md#karma-object) to your liking if they're not to your taste.

**Test framework** - we like [Tape](https://github.com/substack/tape) because it's explicit, simple and comes with its own assertions, but it lacks some features which are common and useful, such as before/after hooks.

[Mocha](https://mochajs.org/) was chosen as the default test framework as it seems fairly uncontroversial.

**Assertion library** - this really doesn't matter in terms of configuration, as Karma doesn't need to know anything about it, but we wanted to include simple, runnable tests with each project template. Making nwb's dependencies act as a fallback for dependency resolution means you get use of this library for free if you want it.

[expect](https://github.com/mjackson/expect) was chosen for this purpose as it's easy to work with and, comes with built-in spy functionality and has useful extension modules like [expect-jsx]() and [expect-dom]()
