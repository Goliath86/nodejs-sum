# nodejs-sum
## Simple Update Manager
![node](https://img.shields.io/node/v/passport.svg?style=plastic)

A very simple update manager for Electron apps on Windows OS.

This is a collection of useful functions for apps for Windows maded with Electron to update them in an easy way. You only have to add this package to your app and execute two functions to perform an update of the app itself.
Basically it allows you to upload a *zip* archive, containing your builded updated app, on a server along with a `version.json` file containing the version and the name of the app inside the zip archive. Then, from you application, you can call a function to search on a specfied url the presence of an update and another function to perform the download, the unzipping and installation of the updated app.

## Installation
```bash
npm install nodejs-sum
```

### DEPENDENCIES
`nodejs`
`adm-zip`

## USAGE
1. Build your project. Pay attention to the `version` string inside the `package.json` file that must be correct.
```bash
npm run build
```
or
```bash
yarn run build
```
Import the module on your project
```javascript
const sumHelper = require('nodejs-sum');
```

Call the function to search for




For the moment this package only supports Windows OS but in the future I will support other OS.

