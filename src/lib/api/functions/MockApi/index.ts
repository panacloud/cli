import { startSpinner, stopSpinner } from "../../../spinner";
import { copyFileAsync, mkdirRecursiveAsync } from "../../../fs";
import { Config, ApiModel } from "../../../../utils/constants";
import { generator } from "../../generators";
import { introspectionFromSchema, buildSchema } from "graphql";
import { buildSchemaToTypescript } from "../../buildSchemaToTypescript";
const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const exec = require("await-exec");
const fse = require("fs-extra");
const _ = require("lodash");

async function mockApi(config: Config, templateDir: string) {
  const {
    api: { schemaPath },
  } = config;

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
    if (
      file !== "package.json" &&
      file !== "cdk.json" &&
      file !== "lambdaLayer"
    ) {
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

  // // Updating fileName
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

  await mkdirRecursiveAsync(`graphql`);
  await mkdirRecursiveAsync(`graphql/schema`);

  let schema = fs.readFileSync(schemaPath, "utf8", (err: string) => {
    if (err) {
      stopSpinner(generatingCode, `Error: ${err}`, true);
      process.exit(1);
    }
  });

  let directivesPath = path.resolve(
    __dirname,
    "../../../../utils/awsAppsyncDirectives.graphql"
  );

  let scalarPath = path.resolve(
    __dirname,
    "../../../../utils/awsAppsyncScalars.graphql"
  );

  let directives = fs.readFileSync(directivesPath, "utf8", (err: string) => {
    if (err) {
      stopSpinner(generatingCode, `Error: ${err}`, true);
      process.exit(1);
    }
  });

  let scalars = fs.readFileSync(scalarPath, "utf8", (err: string) => {
    if (err) {
      stopSpinner(generatingCode, `Error: ${err}`, true);
      process.exit(1);
    }
  });

  fs.writeFileSync(
    `./graphql/schema/schema.graphql`,
    `${scalars}\n${schema}`,
    (err: string) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    }
  );

  const gqlSchema = buildSchema(`${scalars}\n${directives}\n${schema}`);
  const mockApiCollection = buildSchemaToTypescript(gqlSchema);

  // Model Config
  const queriesFields: any = gqlSchema.getQueryType()?.getFields();
  const mutationsFields: any = gqlSchema.getMutationType()?.getFields();
  model.api.schema = introspectionFromSchema(gqlSchema);
  model.api.queiresFields = [...Object.keys(queriesFields)];
  model.api.mutationFields = [...Object.keys(mutationsFields)];
  model.api.mockApiData = mockApiCollection;

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

  stopSpinner(installingModules, "Modules installed", false);
}

export default mockApi;
