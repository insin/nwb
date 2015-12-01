## Tool Choices

The tools nwb uses are chosen based on the common things we need to do, what's widely in use and most importantly what we happened to get working satisfactorily first and ended up duplicating configuration for across multiple projects.

If you prefer a different tool for `<%= reasons %>` or tried things in a different order, or had a different experience, it probably would have been good enough too, but we had to stop choosing and get working.

### Stable picks - not likely to change

**Transpiler** - we need a transpiler for [JSX](http://facebook.github.io/jsx/); we had to set up a build for that, so we might as well use ES6 features too; oh look, it also supports some experimental feature proposals; ...; we can't ever go back!

This is the [Babel](http://babeljs.io/) via React experience. nwb currently uses version 5 of Babel, which is no longer actively supported, but has everything we need bundled right out of the box, and more importantly - hot reloading tools for React are still catching up with Babel 6.

**Module bundler** - we need to take our source code and do all sorts of things with it: transpiling it, bundling it up, splitting it into different chunks based on who made it or when it needs to be loaded, hot reloading it. minifying it, adding banner comments to it and more.

It would also be nice if we also had a common way to manage the CSS and image dependencies both we and our dependencies have.

nwb uses [Webpack](https://webpack.github.io/) for this, and it plays a key part in making configurable builds manageable.

**Package management** - [npm](https://www.npmjs.com).

### "It'll do" picks - no strong opinion

**Test runner** - since we're writing code which will run in web browsers, we want to run our tests in them. Make that multiple browsers. And we want to re-run the tests every time they change. And we need to use our module bundler and transpiler to make the code runnable. And we want to instrument the code for various reasons.

[Karma](http://karma-runner.github.io) will do just fine. It's configured to use [PhantomJS](http://phantomjs.org/) by default.

**Testing isn't configurable in 0.1 - this will be dealt with in future releases.**

### "But I don't *want* to pick" picks - only to get 0.1 out the door

**Test framework** - unfortunately, Karma needs to know about whatever we'll be using to drive our unit tests. We prefer [Tape](https://github.com/substack/tape) because it's simple and comes with its own assertions, but it does lack features which are common and useful, such as before/after hooks.

[Mocha](https://mochajs.org/) was chosen as the default test framework as it seems fairly uncontroversial.

**Assertion library** - this really doesn't matter in terms of configuration, as Karma doesn't need to know anything about it, but we wanted to include simple, runnable tests with each project template. Making nwb's dependencies act as a fallback for dependency resolution means you get use of this library for free, with an easy way to transition off it if it changes.

[expect](https://github.com/mjackson/expect) was chosen for this purpose as it's easy to work with and also comes with built-in spy functionality.
