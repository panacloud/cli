import { startSpinner, stopSpinner } from "../../../spinner";
import { writeFileAsync, copyFileAsync, mkdirRecursiveAsync } from "../../../fs";
import { contextInfo } from "../../info";
import { Config } from "../../../../utils/constants";
const exec = require("await-exec");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");

async function basicApi(config: Config) {
  const USER_DIRECTORY = _.snakeCase(path.basename(process.cwd()));

  const generatingCode = startSpinner("Generating CDK Code...");

  /* copy files from util of codebuild to root directory */
  // fs.readdirSync(
  //   path.join(process.cwd(), `${PATH.utils}/cdk-template`)
  // ).forEach((file: any) => {
  //   copyFileAsync(
  //     path.join(process.cwd(), `${PATH.utils}/cdk-template/${file}`),
  //     file,
  //     (err: string) => {
  //       if (err) {
  //         stopSpinner(generatingCode, `Error: ${err}`, true);
  //         process.exit(1);
  //       }
  //     }
  //   );
  // });

  // const stackPackageJson = JSON.parse(
  //   fs.readFileSync(`${PATH.utils}/package-template/stack/package.json`)
  // );

  // stackPackageJson.bin = `bin/${USER_DIRECTORY}.js`;
  // stackPackageJson.name = USER_DIRECTORY;

  // writeFileAsync(
  //   `./package.json`,
  //   JSON.stringify(stackPackageJson),
  //   (err: string) => {
  //     if (err) {
  //       stopSpinner(generatingCode, `Error: ${err}`, true);
  //       process.exit(1);
  //     }
  //   }
  // );

  writeFileAsync(
    `./cdk.context.json`,
    JSON.stringify(contextInfo(config.api_token, config.entityId)),
    (err: string) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  // writeFileAsync(
  //   `./cdk.json`,
  //   JSON.stringify(cdkInfo(USER_DIRECTORY)),
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
