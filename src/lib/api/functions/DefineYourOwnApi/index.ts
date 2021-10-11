import { startSpinner, stopSpinner } from "../../../spinner";
import {
  writeFileAsync,
  copyFileAsync,
  mkdirRecursiveAsync,
} from "../../../fs";
import { contextInfo, generatePanacloudConfig } from "../../info";
import { Config, APITYPE, ApiModel, PanacloudconfigFile } from "../../../../utils/constants";
import { generator } from "../../generators";
import { introspectionFromSchema, buildSchema } from "graphql";
import { buildSchemaToTypescript } from "../../buildSchemaToTypescript";
import { CreateAspects } from "../../generators/Aspects";
const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const exec = require("await-exec");
const fse = require("fs-extra");
const _ = require("lodash");

async function defineYourOwnApi(config: Config, templateDir: string) {
  const { api_token, entityId } = config;

  const {
    api: { schemaPath, apiType },
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
    if (file !== "package.json" && file !== "cdk.json") {
      if (file === "gitignore") {
        fse.copy(`${templateDir}/${file}`, ".gitignore");
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

  if (apiType === APITYPE.graphql) {
    await mkdirRecursiveAsync(`custom_src`);
    await mkdirRecursiveAsync(`custom_src/graphql`);
    await mkdirRecursiveAsync(`custom_src/graphql/schema`);
//    await mkdirRecursiveAsync(`custom_src/aspects`);
  } else {
    await mkdirRecursiveAsync(`schema`);
  }

  let schema = fs.readFileSync(schemaPath, "utf8", (err: string) => {
    if (err) {
      stopSpinner(generatingCode, `Error: ${err}`, true);
      process.exit(1);
    }
  });
  let updatedPanacloudConfig: any;

  if (apiType === APITYPE.graphql) {
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
      `./custom_src/graphql/schema/schema.graphql`,
      `${scalars}\n${schema}`,
      (err: string) => {
        if (err) {
          stopSpinner(generatingCode, `Error: ${err}`, true);
          process.exit(1);
        }
      }
    );

    const gqlSchema = buildSchema(`${scalars}\n${directives}\n${schema}`);

    // Model Config
    const queriesFields: any = gqlSchema.getQueryType()?.getFields();
    const mutationsFields: any = gqlSchema.getMutationType()?.getFields();
    model.api.schema = introspectionFromSchema(gqlSchema);
    model.api.queiresFields = [...Object.keys(queriesFields)];
    model.api.mutationFields = [...Object.keys(mutationsFields)];
    if (apiType === APITYPE.graphql) {
      updatedPanacloudConfig = await generatePanacloudConfig(
        model.api.queiresFields,
        model.api.mutationFields
      );

      const mockApiCollection = buildSchemaToTypescript(gqlSchema);
      model.api.mockApiData = mockApiCollection;
    }
  } else {
    copyFileAsync(
      schemaPath,
      `./schema/${path.basename(schemaPath)}`,
      (err: string) => {
        if (err) {
          stopSpinner(generatingCode, `Error: ${err}`, true);
          process.exit(1);
        }
      }
    );
    if (
      path.extname(schemaPath) === ".yml" ||
      path.extname(schemaPath) === ".yaml"
    ) {
      schema = YAML.parse(schema);
      model.api.schema = schema;
    }
  }

  await CreateAspects({config:model});

  // Codegenerator Function
  await generator(model, updatedPanacloudConfig);

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

export default defineYourOwnApi;
