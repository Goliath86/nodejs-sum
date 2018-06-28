export default {
  /** @description Check at the specified path a JSON file with the number of version of the app
   * @param {string} url where to find the version.json file with the number of version
   * @param {string} currentVersion of the app to be compared to the one finded on the version.json file on the server
   * @param {array} result [{boolean} new update available, {string} new version number, {string} new version app name, {string} error message]
   */
  checkUpdates(url, currentVersion, result) {
    const request = require('request');

    request(url)
      .on('data', (data) => {
        let newVersion = null;
        let appName = null;

        result.splice(0, 1, false);

        try {
          // Retrieve the new version number
          if (JSON.parse(data).version) {
            newVersion = JSON.parse(data).version;
            console.log(newVersion);
          }

          // Retrieve the name of the app
          if (JSON.parse(data).name) {
            appName = JSON.parse(data).name;
            console.log(appName);
          }

          // Check if an update is available
          if (newVersion) {
            if (newVersion !== currentVersion) {
              result.splice(0, 1, true);
            }
          }

          // Return the array
        } catch (error) {
          console.log(error);
          result.splice(3, 1, `Errore durante il parsing del file JSON di versione ricevuto dal sito: ${error}`);
        } finally {
          // Load all the values on the result array
          result.splice(1, 1, newVersion);
          result.splice(2, 1, appName);
        }
      })
      .on('error', (err) => {
        console.log(err.message);
        result = [false, null, null, `Errore durante la richiesta di controllo di una nuova versione del programma: ${err.message}`];
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
        console.log(`Errore nella creazione della cartella per il salvataggio degli aggiornamenti:${endOfLine} ${error.message}`);
        result.splice(0, 1, `Errore nella creazione della cartella per il salvataggio degli aggiornamenti:${endOfLine} ${error.message}`);
        return;
      }
    }

    // Create a write stream
    let file = null;

    try {
      file = fs.createWriteStream(path.resolve(`./updates/${fileName}`));
    } catch (error) {
      console.log(`Errore durante la creazione dello stream di scrittura:${endOfLine} ${error.message}`);
      result.splice(0, 1, `Errore durante la creazione dello stream di scrittura:${endOfLine} ${error.message}`);
      return;
    }


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
        console.log(`Errore di download del file di update. Codice di risposta: ${response.statusCode.toString()}`);
        result.splice(0, 1, `Errore di download del file di update. Codice di risposta: ${response.statusCode.toString()}`);
      }
    });


    file.on('error', (err) => {
      console.log(`Errore di download del file di update:${endOfLine} ${err.message}`);
      result.splice(0, 1, `Errore di download del file di update:${endOfLine} ${err.message}`);
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
