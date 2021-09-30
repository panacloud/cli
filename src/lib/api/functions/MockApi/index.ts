import { startSpinner, stopSpinner } from "../../../spinner";
import {writeFileAsync,copyFileAsync,mkdirRecursiveAsync} from "../../../fs";
import { contextInfo } from "../../info";
import { Config, APITYPE, ApiModel } from "../../../../utils/constants";
import { generator } from "../../generators";
import {  introspectionFromSchema } from "graphql";
import { loadSDLSchema } from "../../../../utils/loading";
const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const exec = require("await-exec");
const fse = require("fs-extra");
const _ = require("lodash");

async function MockApi(config: Config, templateDir: string) {
  const { api_token, entityId } = config;
  const { api: { schemaPath, apiType }} = config;
  const workingDir = _.snakeCase(path.basename(process.cwd()));
  const model: ApiModel = {
    api: { 
      ...config.api,
    },
    workingDir: workingDir,
  };
  const generatingCode = startSpinner("Generating CDK Code...");
  /* copy files from global package dir to cwd */
  fs.readdirSync(templateDir).forEach(async (file: any) => {
    if (file !== "package.json" && file !== "cdk.json") {
      if (file === "gitignore") {
        await fse.copy(`${templateDir}/${file}`, ".gitignore");
      } else {
        await fse.copy(`${templateDir}/${file}`, file, (err: string) => {
          if (err) {
            stopSpinner(generatingCode, `Error: ${err}`, true);
            process.exit(1);
          }
        });
      }
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

  writeFileAsync(
    `./cdk.context.json`,
    JSON.stringify(contextInfo(api_token, entityId)),
    (err: string) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  await mkdirRecursiveAsync(`schema`);

  copyFileAsync(
    schemaPath,
    `./schema/${
      apiType === APITYPE.graphql
        ? path.basename(schemaPath)
        : path.basename(schemaPath)
    }`,
    (err: string) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  let schema = fs.readFileSync(schemaPath, "utf8", (err: string) => {
    if (err) {
      stopSpinner(generatingCode, `Error: ${err}`, true);
      process.exit(1);
    }
  });


  if (path.extname(schemaPath) === ".yml" ||path.extname(schemaPath) === ".yaml") {
    schema = YAML.parse(schema);
  } else {
    const schemaAst = loadSDLSchema(schemaPath)
    const queriesFields : any = schemaAst.getQueryType()?.getFields()
    const mutationsFields : any = schemaAst.getMutationType()?.getFields()
    model.api.schema = introspectionFromSchema(schemaAst)
    model.api.queiresFields = [...Object.keys(queriesFields)] 
    model.api.mutationFields = [...Object.keys(mutationsFields)]
   }

  // Codegenerator Function
  await generator(model);

  stopSpinner(generatingCode, "CDK Code Generated", false);

  const installingModules = startSpinner("Installing Modules");

  try {
    await exec(`npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  try {
    await exec(`cd lambdaLayer/nodejs && npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  stopSpinner(installingModules, "Modules installed", false);
}

export default MockApi;
