const fs = require("fs");
const fse = require('fs-extra')
const { promisify } = require("util");
const makeDir = require("make-dir");
const chalk = require('chalk');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const rmFileAsync = promisify(fs.unlink);
const copyFileAsync = promisify(fs.copyFile);
const rmDirAsync = promisify(fs.rmdir);
const accessAsync = promisify(fs.access);
const writeFileSync = fs.writeFileSync;
const copyDirSync = fse.copySync

const fileExistsAsync = async (filePath: string) => {
  try {
    await accessAsync(filePath, fs.F_OK);
    return true;
  } catch (_) {
    console.log("\n")
    console.log(chalk.red("Add a valid path!"))
    console.log("\n")
    return false;
  }
};

const mkdirRecursiveAsync = (path: string) => makeDir(path);

export {
  readFileAsync,
  rmDirAsync,
  copyFileAsync,
  copyDirSync,
  rmFileAsync,
  writeFileAsync,
  writeFileSync,
  fileExistsAsync,
  mkdirRecursiveAsync,
};
