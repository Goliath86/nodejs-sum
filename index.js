module.exports = {
  /** @description Check at the specified path a JSON file with the number of version of the app
   *  @param {string} url where to find the version.json file with the number of version
   *  @param {string} currentVersion of the app to be compared to the one finded on the version.json file on the server
   *  @param {array} result [{boolean} new update available, {string} new version number, {string} new version app name, {string} error message]
   */
  checkUpdates(url, currentVersion, result) {
    const request = require('request');

    // Set a request at the specified url
    request(url)
      .on('data', (data) => {
        let newVersion = null;
        let appName = null;

        result.splice(0, 1, false);

        try {
          // Retrieve the new version number
          if (JSON.parse(data).version) {
            newVersion = JSON.parse(data).version;
            console.log(`Application version on update server: ${newVersion}`);
          }

          // Retrieve the name of the app
          if (JSON.parse(data).name) {
            appName = JSON.parse(data).name;
            console.log(`Application name readed from update server: ${appName}`);
          }

          // Check if an update is available
          if (newVersion) {
            if (newVersion !== currentVersion) {
              result.splice(0, 1, true);
            }
          }
        } catch (error) {
          console.log(`Error parsing the JSON version file on update server: ${error}`);
          result.splice(3, 1, `Error parsing the JSON version file on update server: ${error}`);
        } finally {
          // Load all the values on the result array
          result.splice(1, 1, newVersion);
          result.splice(2, 1, appName);
        }
      })

      .on('error', (error) => {
        console.log(`Error requesting the update version number: ${error}`);
        result = [false, null, null, `Error requesting the update version number: ${error}`];
      });
  },

  /** @description Download the update zip file from the specified url
   *  @param {string} url where to find the update zip archive
   *  @param {string} fileName the name to assign at the downloaded zip file
   *  @param {string} appName the name of the app inside the package.json file
   *  @param {string} version the version of the update
   *  @param {array} result [{string} if error or {null} if success]
   */
  downloadUpdate(url, fileName, appName, version, result) {
    const http = require('http');
    const fs = require('fs');
    const path = require('path');
    const endOfLine = require('os').EOL;

    if (!fs.existsSync(path.resolve('./updates'))) {
      try {
        fs.mkdirSync(path.resolve('./updates'));
      } catch (error) {
        console.log(`Error creating the default folder for saving the update files: ${endOfLine} ${error}`);
        result.splice(0, 1, `Error creating the default folder for saving the update files: ${endOfLine} ${error}`);
        return;
      }
    }

    let file = null;
    
    // Create a write stream
    try {
      file = fs.createWriteStream(path.resolve(`./updates/${fileName}`));
    } catch (error) {
      console.log(`Error during the creation of the write stream: ${endOfLine} ${error}`);
      result.splice(0, 1, `Error during the creation of the write stream: ${endOfLine} ${error}`);
      return;
    }

    // Download the update archive from the specified url
    http.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);

        // When the update file is completely downloaded
        file.on('finish', () => {
          file.close(() => {
            console.log('closing');
            this.unzipAndInstall(fileName, appName, version, result);
          });
        });
      } else {
        console.log(`Error downloading the update. Response status code: ${response.statusCode.toString()}`);
        result.splice(0, 1, `Error downloading the update. Response status code: ${response.statusCode.toString()}`);
      }
    });


    file.on('error', (error) => {
      console.log(`Error downloading the update:${endOfLine} ${error}`);
      result.splice(0, 1, `Error downloading the update:${endOfLine} ${error}`);
    });
  },

  /** @description Unzip the specified file and launch the setup file
   *  @param {string} fileName the name of the zip file to unzip
   *  @param {string} appName the name of the app inside the package.json file
   *  @param {string} version the version of the update
   *  @param {array} result [{string} if an error occur {null} if success]
   */
  unzipAndInstall(fileName, appName, version, result) {
    const AdmZip = require('adm-zip');
    const path = require('path');

    const directory = path.resolve(`./updates/${fileName}`);
    const zip = new AdmZip(directory);

    // Extract the update file on the specified resolved path
    const dir = path.resolve('./updates');
    zip.extractAllTo(dir, true);

    // Run the installer
    this.runInstaller(appName, version, result);
  },

  /** @description Run the setup file
   *  @param {string} fileName the name of the zip file to unzip
   *  @param {string} appName the name of the app inside the package.json file
   *  @param {string} version the version of the update
   *  @param {array} result [{string} if an error occur {string} = 'success' if success]
   */
  runInstaller(appName, version, result) {
    const shell = require('electron').shell;
    const path = require('path');

    if (process.platform === 'win32') {
      shell.openExternal(path.resolve(`${process.cwd()}/updates/${appName} Setup ${version}.exe`));
    }

    result.splice(0, 1, 'success');
  },
};
