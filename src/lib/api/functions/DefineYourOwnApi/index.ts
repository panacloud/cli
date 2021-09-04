import { startSpinner, stopSpinner } from "../../../spinner";
import {
  writeFileAsync,
  copyFileAsync,
  mkdirRecursiveAsync,
  writeFileSync,
} from "../../../fs";
import { contextInfo } from "../../info";
import { Config, APITYPE } from "../../../../utils/constants";
const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const convert = require("graphql-to-json-converter");
const exec = require("await-exec");
const fse = require("fs-extra");
const _ = require("lodash");

async function defineYourOwnApi(config: Config, templateDir: string) {
  const { api_token, entityId } = config;

  const { schemaPath, apiType } = config.api;

  const USER_DIRECTORY = _.snakeCase(path.basename(process.cwd()));

  const generatingCode = startSpinner("Generating CDK Code...");

  /* copy files from util of .panacloud to root directory */

  await fs.readdirSync(templateDir).forEach(async (file: any) => {
    await fse.copy(`${templateDir}/${file}`, file, (err: string) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    });
  });

  // const stackPackageJson = JSON.parse(
  //   fs.readFileSync(`${PATH.utils}/package-template/stack/package.json`)
  // );
  // const layerPackageJson = JSON.parse(
  //   fs.readFileSync(`${PATH.utils}/package-template/lambdaLayer/package.json`)
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

  // await mkdirRecursiveAsync(`lambdaLayer/nodejs`);

  // writeFileAsync(
  //   `./lambdaLayer/nodejs/package.json`,
  //   JSON.stringify(layerPackageJson),
  //   (err: string) => {
  //     if (err) {
  //       stopSpinner(generatingCode, `Error: ${err}`, true);
  //       process.exit(1);
  //     }
  //   }
  // );

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

  // mkdirRecursiveAsync(`schema`);

  // copyFileAsync(
  //   schemaPath,
  //   `./schema/${
  //     apiType === APITYPE.graphql
  //       ? path.basename(schemaPath)
  //       : path.basename(schemaPath)
  //   }`,
  //   (err: string) => {
  //     if (err) {
  //       stopSpinner(generatingCode, `Error: ${err}`, true);
  //       process.exit(1);
  //     }
  //   }
  // );

  // let schema = fs.readFileSync(schemaPath, "utf8", (err: string) => {
  //   if (err) {
  //     stopSpinner(generatingCode, `Error: ${err}`, true);
  //     process.exit(1);
  //   }
  // });

  // if (
  //   path.extname(schemaPath) === ".yml" ||
  //   path.extname(schemaPath) === ".yaml"
  // ) {
  //   schema = JSON.stringify(YAML.parse(schema));
  // }

  // const jsonSchema =
  //   apiType === APITYPE.graphql
  //     ? convert(schema)
  //     : { openApiDef: JSON.parse(schema) };

  // copyFileAsync(
  //   schemaPath,
  //   `.panacloud/schema.${
  //     apiType === APITYPE.graphql ? "graphql" : `${path.extname(schemaPath)}`
  //   }`,
  //   (err: string) => {
  //     if (err) {
  //       stopSpinner(generatingCode, `Error: ${err}`, true);
  //       process.exit(1);
  //     }
  //   }
  // );

  // writeFileAsync(
  //   `.panacloud/model.json`,
  //   JSON.stringify({
  //     ...jsonSchema,
  //     USER_WORKING_DIRECTORY: USER_DIRECTORY,
  //     api: {
  //       ...config.api,
  //     },
  //   }),
  //   (err: string) => {
  //     if (err) {
  //       stopSpinner(generatingCode, `Error: ${err}`, true);
  //       process.exit(1);
  //     }
  //   }
  // );

  // await start();

  stopSpinner(generatingCode, "CDK Code Generated", false);

  const installingModules = startSpinner("Installing Modules");

  // try {
  //   await exec(`npm install`);
  // } catch (error) {
  //   stopSpinner(installingModules, `Error: ${error}`, true);
  //   process.exit(1);
  // }

  // try {
  //   await exec(`cd lambdaLayer/nodejs && npm install`);
  // } catch (error) {
  //   stopSpinner(installingModules, `Error: ${error}`, true);
  //   process.exit(1);
  // }

  stopSpinner(installingModules, "Modules installed", false);
}

export default defineYourOwnApi;
