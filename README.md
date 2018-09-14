# TEG Marketplace Homepage (client)

This repository hosts the client-side webcontent for the TEG Marketplace.

## Quickstart

* Run `npm rebuild` if you just checked the repository out to build modules
  specific to your system

* Run `npm run start` to start the site up using webpack-dev-server.

## Structure

This project is built by webpack as a static EJS-templated website. All
code and content is stored under `src/`.

The main entrypoint is `index.js` for client-side code. `index.ejs`
is the main EJS template which is used to load `index.js`.

You should add main page dependencies as `require("..")` statements in the
`index.js` files. Webpack will pick them up, minify and compress them, and
create cacheable content bundles from them.

You should modify main-page EJS in `index.ejs`.

## Configuration

A global project config file is deployed via the webpackDefine plugin. It defaults
to `project_configs/dev.json` which works for the deployed development environment.

You can specify `MARKETPLACE_PROJECT_CONFIG_FILE=project_configs/remote-dev.json` to
use the currently deployed dev-master for all endpoints while developing locally.

If you are developing, remember to extend these files as necessary with this sort of
configuration.

`feature-content.json` is a stub. In future it will be dynamically loaded from
a GCP bucket which is updated via a cron-job.

## Requirements

* [NodeJS 8](https://nodejs.org/en/download/).

## CI

All code should be submitted as a pull request to the bitbucket repository.
There is undergoes automated testing as defined by the
`bitbucket-pipelines.yaml` file.

## Deployment

On submitting to master the code is compiled into production settings by the
Google Container Builder and is pushed to AppEngine. This is controlled by the
cloudbuild.yaml file.
