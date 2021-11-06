import { startSpinner, stopSpinner } from "../../../spinner";
import {
  writeFileAsync,
  copyFileAsync,
  mkdirRecursiveAsync,
} from "../../../fs";
import { contextInfo } from "../../info";
import { Config } from "../../../../utils/constants";
const exec = require("await-exec");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const _ = require("lodash");

async function basicApi(config: Config, templateDir: string) {
  // const { api_token, entityId } = config;

  const workingDir = _.snakeCase(path.basename(process.cwd()));
  const generatingCode = startSpinner("Generating CDK Code...");

  /* copy files from global package dir to cwd */
  fs.readdirSync(templateDir).forEach(async (file: any) => {
    if (file !== "package.json" && "cdk.json") {
      await fse.copy(`${templateDir}/${file}`, file, (err: string) => {
        if (err) {
          stopSpinner(generatingCode, `Error: ${err}`, true);
          process.exit(1);
        }
      });
    }
  });

  // Updating fileName
  const stackPackageJson = JSON.parse(
    fs.readFileSync(`${templateDir}/package.json`)
  );
  const cdkJson = JSON.parse(fs.readFileSync(`${templateDir}/cdk.json`));

  stackPackageJson.bin = `bin/${workingDir}.js`;
  stackPackageJson.name = workingDir;

  cdkJson.app = `npx ts-node --prefer-ts-exts bin/${workingDir}.ts`;

  await fs.writeFileSync(
    `./package.json`,
    JSON.stringify(stackPackageJson),
    (err: string) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  await fs.writeFileSync(
    `./cdk.json`,
    JSON.stringify(cdkJson),
    (err: string) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  // writeFileAsync(
  //   `./cdk.context.json`,
  //   JSON.stringify(contextInfo(api_token, entityId)),
  //   (err: string) => {
  //     if (err) {
  //       stopSpinner(generatingCode, `Error: ${err}`, true);
  //       process.exit(1);
  //     }
  //   }
  // );

  mkdirRecursiveAsync(`lib`);
  mkdirRecursiveAsync(`bin`);

  writeFileAsync(
    `./lib/${path.basename(process.cwd())}-stack.ts`,
    `import * as cdk from "@aws-cdk/core";
       import { PanacloudManager } from 'panacloud-manager';
      
       export class ${_.upperFirst(
         _.camelCase(path.basename(process.cwd()))
       )}Stack extends cdk.Stack {
          constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
             super(scope, id, props);
      
          const api_manager = new PanacloudManager(this, "PanacloudAPIManager");
          
        }
      }`,
    (err: any) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  writeFileAsync(
    `./bin/${path.basename(process.cwd())}-stack.ts`,
    `import 'source-map-support/register';
    import * as cdk from 'aws-cdk-lib';
    import { ${_.upperFirst(
      _.camelCase(path.basename(process.cwd()))
    )}Stack } from '../lib/${path.basename(process.cwd())}-stack';
    
    const app = new cdk.App();
    new ${_.upperFirst(
      _.camelCase(path.basename(process.cwd()))
    )}Stack(app, '${_.upperFirst(_.camelCase(path.basename(process.cwd())))}', {
    });`,
    (err: any) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  stopSpinner(generatingCode, "CDK Code Generated", false);

  const installingModules = startSpinner("Installing Modules");

  try {
    await exec(`npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  stopSpinner(installingModules, "Modules installed", false);
}

export default basicApi;
