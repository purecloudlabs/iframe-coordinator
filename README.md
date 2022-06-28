# Iframe Coordinator Monorepo

## Getting Started

There is no need to run commands within each of the packages, setup can be done in the root monorepo directory (the parent directory of this README)

- `npm install` 
  - installs each of the packages and in the example client app

- `npm run build` 
  - builds each of the packages and in the example client app
## Running the example app locally

The apps can be run locally as a demo embedded in the ifc-cli host. To do so you'll need to run the following
commands from the iframe-coordinator-monorepo project root (the parent directory of this README):

`npm install`

`npm run build`

`npm run start-client-example`

You can then see the apps embedded in a host at http://localhost:3000/#/app1 and http://localhost:3000/#/app2

## Update versions

As a best practice, the versions of `iframe-coordinator-monorepo` project, `ifc-cli`, `iframe-coordinator`, and the example app should be kept in sync and version bumps . To update the version:

- Bump the version in the `package.json` of the `iframe-coordinator-monorepo` project

- `npm run sync-versions` in the `iframe-coordinator-monorepo` project root
  - This command will update the version in `ifc-cli`, `iframe-coordinator`, and the example client app.