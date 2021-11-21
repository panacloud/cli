import { snakeCase } from "lodash";
import { basename, resolve, extname } from "path";
import {
  writeJsonSync,
  readJsonSync,
  copy,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs-extra";
import { startSpinner, stopSpinner } from "../../../spinner";
import { mkdirRecursiveAsync } from "../../../fs";
import { generatePanacloudConfig } from "../../info";
import { Config, APITYPE, ApiModel } from "../../../../utils/constants";
import { generator } from "../../generators";
import { introspectionFromSchema, buildSchema } from "graphql";
import { buildSchemaToTypescript } from "../../buildSchemaToTypescript";
import { FieldsAndLambdaForNestedResolver } from "../../helpers";
import { CreateAspects } from "../../generators/Aspects";
import { microServicesDirectiveFieldSplitter } from "../../directives/microServicesDirective";
import { RootMockObject, TestCollectionType } from "../../apiMockDataGenerator";
import {
  asyncDirectiveFieldSplitter,
  asyncDirectiveResponseCreator,
} from "../../directives/asyncDirective";

const YAML = require("yamljs");
const exec = require("await-exec");

async function defineYourOwnApi(
  config: Config,
  templateDir: string
): Promise<void> {
  // const { api_token, entityId } = config;

  const {
    api: { schemaPath, apiType, nestedResolver },
  } = config;

  const dummyData: TestCollectionType = { fields: {} };

  const workingDir = snakeCase(basename(process.cwd()));

  const model: ApiModel = {
    api: {
      ...config.api,
    },
    workingDir: workingDir,
  };

  const generatingCode = startSpinner("Generating CDK Code...");
  /* copy files from global package dir to cwd */
  readdirSync(templateDir).forEach((file: any) => {
    if (file !== "package.json" && file !== "cdk.json") {
      if (file === "gitignore") {
        copy(`${templateDir}/${file}`, ".gitignore");
      } else if (file === "lambdaLayer") {
        copy(`${templateDir}/${file}`, "mock_lambda_layer", (err: Error) => {
          if (err) {
            stopSpinner(generatingCode, `Error: ${err}`, true);
            process.exit(1);
          }
        });
        copy(
          `${templateDir}/${file}`,
          "editable_src/customMockLambdaLayer",
          (err: Error) => {
            if (err) {
              stopSpinner(generatingCode, `Error: ${err}`, true);
              process.exit(1);
            }
          }
        );
      } else {
        copy(`${templateDir}/${file}`, file, (err: Error) => {
          if (err) {
            stopSpinner(generatingCode, `Error: ${err}`, true);
            process.exit(1);
          }
        });
      }
    }
  });

  // Updating fileName
  const stackPackageJson = readJsonSync(`${templateDir}/package.json`);

  const cdkJson = readJsonSync(`${templateDir}/cdk.json`);

  stackPackageJson.bin = `bin/${workingDir}.js`;
  stackPackageJson.name = workingDir;

  cdkJson.app = `npx ts-node --prefer-ts-exts bin/${workingDir}.ts`;

  writeJsonSync(`./package.json`, stackPackageJson);

  writeJsonSync(`./cdk.json`, cdkJson);

  // await fse.writeJson(
  //   `./cdk.context.json`,
  //   contextInfo(api_token, entityId),
  //   (err: string) => {
  //     if (err) {
  //       stopSpinner(generatingCode, `Error: ${err}`, true);
  //       process.exit(1);
  //     }
  //   }
  // );

  if (apiType === APITYPE.graphql) {
    await mkdirRecursiveAsync(`editable_src`);
    await mkdirRecursiveAsync(`editable_src/graphql`);
    await mkdirRecursiveAsync(`editable_src/graphql/schema`);
    await mkdirRecursiveAsync(`editable_src/aspects`);
    await mkdirRecursiveAsync(`editable_src/lambda_stubs`);
    await mkdirRecursiveAsync(`tests`);
    await mkdirRecursiveAsync(`tests/apiTests`);
    await mkdirRecursiveAsync(`.panacloud`);
    await mkdirRecursiveAsync(`.panacloud/editable_src`);
    await mkdirRecursiveAsync(`.panacloud/editable_src/graphql`);
    await mkdirRecursiveAsync(`.panacloud/editable_src/graphql/schema`);
  } else {
    await mkdirRecursiveAsync(`schema`);
  }

  let schema = readFileSync(schemaPath, "utf8");

  let PanacloudConfig: any;

  if (apiType === APITYPE.graphql) {
    let directivesPath = resolve(
      __dirname,
      "../../../../utils/awsAppsyncDirectives.graphql"
    );

    let scalarPath = resolve(
      __dirname,
      "../../../../utils/awsAppsyncScalars.graphql"
    );

    let directives = readFileSync(directivesPath, "utf8");

    let scalars = readFileSync(scalarPath, "utf8");

    let gqlSchema = buildSchema(`${scalars}\n${directives}\n${schema}`);

    const mockObject = new RootMockObject(gqlSchema);
    mockObject.write(dummyData);

    // Model Config
    let queriesFields: any = gqlSchema.getQueryType()?.getFields();
    let mutationsFields: any = gqlSchema.getMutationType()?.getFields();
    let introspection = introspectionFromSchema(gqlSchema);
    let subscriptionsFields: any = gqlSchema.getSubscriptionType()?.getFields();

    model.api.schema = introspection;
    model.api.queiresFields = [...Object.keys(queriesFields)];
    model.api.mutationFields = [...Object.keys(mutationsFields)];

    const fieldSplitterOutput = microServicesDirectiveFieldSplitter(
      queriesFields,
      mutationsFields
    );

    model.api.generalFields = fieldSplitterOutput.generalFields;
    model.api.microServiceFields = fieldSplitterOutput.microServiceFields;

    const asyncFieldSplitterOutput =
      asyncDirectiveFieldSplitter(mutationsFields);

    const newSchema = asyncDirectiveResponseCreator(
      mutationsFields,
      subscriptionsFields,
      schema,
      asyncFieldSplitterOutput
    );

    if (asyncFieldSplitterOutput && asyncFieldSplitterOutput.length > 0) {
      gqlSchema = buildSchema(`${scalars}\n${directives}\n${newSchema}`);

      queriesFields = gqlSchema.getQueryType()?.getFields();
      mutationsFields = gqlSchema.getMutationType()?.getFields();
      introspection = introspectionFromSchema(gqlSchema);

      model.api.schema = introspection;
      model.api.queiresFields = [...Object.keys(queriesFields)];
      model.api.mutationFields = [...Object.keys(mutationsFields)];
    }

    model.api.schemaPath = `./editable_src/graphql/schema/schema.graphql`;

    model.api.asyncFields = asyncFieldSplitterOutput;

    writeFileSync(
      `./editable_src/graphql/schema/schema.graphql`,
      `${scalars}\n${newSchema}`
    );

    writeFileSync(
      `./.panacloud/editable_src/graphql/schema/schema.graphql`,
      `${scalars}\n${newSchema}`
    );

    // writeFileSync(
    //   "./cdk-outputs.json",
    //   `{
    //   "${config.api.apiName}Stack" : {

    //   }
    // }`
    // );

    const mockApiCollection = buildSchemaToTypescript(gqlSchema, introspection);
    model.api.mockApiData = mockApiCollection;
    // if user selects nested resolver
    if (nestedResolver) {
      const fieldsAndLambdas = FieldsAndLambdaForNestedResolver(
        model,
        gqlSchema
      );
      if (Object.keys(fieldsAndLambdas.nestedResolverFields).length <= 0) {
        stopSpinner(
          generatingCode,
          "Nested Resolvers Are Not Possible With This Schema Normal Resolvers Are Created",
          true
        );
        model.api.nestedResolver = false;
      } else {
        model.api.nestedResolverFieldsAndLambdas = fieldsAndLambdas;
      }
    }
    PanacloudConfig = await generatePanacloudConfig(model);
  } else {
    copy(schemaPath, `./schema/${basename(schemaPath)}`, (err: Error) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    });
    if (extname(schemaPath) === ".yml" || extname(schemaPath) === ".yaml") {
      schema = YAML.parse(schema);
      model.api.schema = schema;
    }
  }

  await CreateAspects({ config: model });

  // Codegenerator Function
  await generator(model, PanacloudConfig, "init", dummyData);

  stopSpinner(generatingCode, "CDK Code Generated", false);

  const installingModules = startSpinner("Installing Modules");

  try {
    await exec(`npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  try {
    await exec(`cd mock_lambda_layer/nodejs && npm i`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  try {
    await exec(
      `cd ./editable_src/customMockLambdaLayer/nodejs/ && npm i && npm i gremlin`
    );
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  stopSpinner(installingModules, "Modules installed", false);
}

export default defineYourOwnApi;
