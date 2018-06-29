# nodejs-sum
## Simple Update Manager
![node](https://img.shields.io/node/v/passport.svg?style=plastic)

A very simple update manager module for Electron apps on Windows OSs.

This is a collection of useful functions for apps for Windows maded with Electron to update them in an easy way. You only have to add this package to your app and execute two functions to perform an update of the app itself.
Basically it allows you to upload a *zip* archive, containing your builded updated app, on a server along with a `version.json` file containing the version and the name of the app inside the zip archive. Then, from you application, you can call a function to search on a specfied url the presence of an update and another function to perform the download, the unzipping and installation of the updated app.

## Installation
```bash
npm install nodejs-sum
```

### DEPENDENCIES
`Electron`
`Node.js`
`adm-zip`

## USAGE
1. Import the module on your project:
```javascript
const sumHelper = require('nodejs-sum');
```
2. Call the function `checkUpdates()` to search for available updates:
```javascript
const result = []; // An empty array that will contain the result of the request
const appVersion = require('../../package.json').version; // A constant with the app version readed directly from the package.json file of the app (pay attention at the path of your package.json file that may not corresponds to the one of this example)

sumHelper.checkUpdates('http://www.yoursite.it/updatesFolder/version.json', appVersion, result); // Search for updates
```
where the `first parameter` is the url where to find the version.json file to read the version informations, the `second parameter` is the current version of the app retrieved directly from the `package.json` file of the app or a manual inserted `string` with the actual app's version number and the `third parameter` is an empty array that will contain the result of the request.

3. Now you have to `watch` the `result[]` array to be fulfilled (this is necessary because all the updates requests and functions are `asynchronous` so it is not possible to wait or block the program execution until the requests and functions are ended). If the `result[]` array will change it will contain:
```
result = [
  0 index = Boolean -> True if an update is available - False otherwise
  1 index = String  -> The new version number of the app readed from the version.json file from the update server
  2 index = String  -> The app name readed from the version.json file from the update server
  3 index = String  -> Present ONLY if errors are throwed and it contains an error message
]
```
4. When an update is found, you can call the other function `downloadUpdate()` that will download the update's zip archive inside a temporary folder (that will be deleted when the update will finish) on the current working directory of the app and will start the executable to install the update:
```javascript
const version = result[1]; // Store the string containing the version of the update
const appName = result[2]; // Store the string containing the app's name
result = [];               // Empty the array to store the result of the next async function

sumHelper.downloadUpdate('http://www.yoursite.it/updatesFolder/update_1.0.0.zip', 'update.zip', appName, version, result);
```
where the `first parameter` is the url where to download the zip archive, the `second parameter` is the name to assign at the downloaded zip archive on your disk, the `third parameter` is the name of the app, the `fourth parameter` is the version of the update and the `fifth parameter` is an empty array that will contain the result of the operation:
```
result = [
  0 index = String -> 'success' if the operations are executed correctly or an error message if errors are throwed
]
```
5. Build your updated project. Pay attention to the `version` string inside the `package.json` file of the app that must be correct.
```bash
npm run build
```
6. Create a `.zip` archive of the builded app's files and name it, for example, `update_1.0.0.zip`.

7. Create a `version.json` file to be uploaded later on your server containing a string with the `version` of the update that will be uploaded on the server and the `name` of the app that you can found on the `package.json` file of the app.
```javascript
{
  "version": "1.0.0",
  "name": "Simple App"
}
```
8. Upload the `update_1.0.0.zip` and the `version.json` file on a folder inside your online server.

**At the moment this package only supports Windows OS but in the future I will support other OS.**

