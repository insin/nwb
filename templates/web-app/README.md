# {{name}}

Collaborating on this web app:

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with npm)
* [nwb](https://github.com/insin/nwb/) - `npm install -g nwb`

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`

## Running / Development

* `nwb serve --reload` will run the app with auto-reloading on every change
* Visit the app at [http://localhost:3000](http://localhost:3000)

### Running Tests

* `nwb test` will run the tests once
* `nwb test --server` will run the tests on every change

### Building

* `nwb build` (production)
* `nwb build --set-env-NODE_ENV=development` (development)
