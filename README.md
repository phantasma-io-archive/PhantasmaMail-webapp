# PhantasmaMail Web App

Access your email on the Phantasma network everytime everywhere!

## Setup

Install `rvm`/`rbenv`, `ruby 2.4.2` and `bundler`. Then run `bundle install`.

Install `nodejs`, `npm` and run `npm install`, and install browserify globally for your version of node: `npm install -g browserify`.

Run `browserify app/javascript/phantasma.js -o app/assets/javascripts/bundle.js` after changing the `phantasma.js` file.

## Run server

`bundle exec rails s` or `bundle exec rackup`
