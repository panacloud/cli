import { startSpinner, stopSpinner } from "../../../spinner";
import { mkdirRecursiveAsync } from "../../../fs";
import { generatePanacloudConfig } from "../../info";
import { Config, APITYPE, ApiModel } from "../../../../utils/constants";
import { generator } from "../../generators";
import { introspectionFromSchema, buildSchema } from "graphql";
import { buildSchemaToTypescript } from "../../buildSchemaToTypescript";
import { FieldsAndLambdaForNestedResolver } from "../../helpers";
import { CreateAspects } from "../../generators/Aspects";
import { microServicesDirectiveFieldSplitter } from "../../microServicesDirective";
import { RootMockObject, TestCollectionType } from "../../apiMockDataGenerator";
import { asyncDirectiveFieldSplitter, asyncDirectiveResponseCreator } from "../../asyncDirective";
const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const exec = require("await-exec");
const fse = require("fs-extra");
const snakeCase = require("lodash/snakeCase");

async function defineYourOwnApi(config: Config, templateDir: string) {
  // const { api_token, entityId } = config;

  const {
    api: { schemaPath, apiType, nestedResolver },
  } = config;

  const dummyData: TestCollectionType = { fields: {} };

  const workingDir = snakeCase(path.basename(process.cwd()));

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
      }
      else {
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
  const stackPackageJson = await fse.readJson(`${templateDir}/package.json`);

  const cdkJson = await fse.readJson(`${templateDir}/cdk.json`);

  stackPackageJson.bin = `bin/${workingDir}.js`;
  stackPackageJson.name = workingDir;

  cdkJson.app = `npx ts-node --prefer-ts-exts bin/${workingDir}.ts`;

  await fse.writeJson(`./package.json`, stackPackageJson, (err: string) => {
    if (err) {
      stopSpinner(generatingCode, `Error: ${err}`, true);
      process.exit(1);
    }
  });

  await fse.writeJson(`./cdk.json`, cdkJson, (err: string) => {
    if (err) {
      stopSpinner(generatingCode, `Error: ${err}`, true);
      process.exit(1);
    }
  });

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
    await mkdirRecursiveAsync(`editable_src/lambda`);

    fs.readdirSync(templateDir).forEach(async (file: any) => {
      if (file === "lambdaLayer") {
        await fse.copy(`${templateDir}/${file}`, "editable_src/lambdaLayer");
      }
    });

  } else {
    await mkdirRecursiveAsync(`schema`);
  }

  let schema = fs.readFileSync(schemaPath, "utf8", (err: string) => {
    if (err) {
      stopSpinner(generatingCode, `Error: ${err}`, true);
      process.exit(1);
    }
  });

  let PanacloudConfig: any;

  if (apiType === APITYPE.graphql) {
    let directivesPath = path.resolve(
      __dirname,
      "../../../../utils/awsAppsyncDirectives.graphql"
    );

    let scalarPath = path.resolve(
      __dirname,
      "../../../../utils/awsAppsyncScalars.graphql"
    );

    let directives = await fs.readFileSync(
      directivesPath,
      "utf8",
      (err: string) => {
        if (err) {
          stopSpinner(generatingCode, `Error: ${err}`, true);
          process.exit(1);
        }
      }
    );

    let scalars = await fs.readFileSync(scalarPath, "utf8", (err: string) => {
      if (err) {
        stopSpinner(generatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    });



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


    const asyncFieldSplitterOutput = asyncDirectiveFieldSplitter(mutationsFields)


    const newSchema = asyncDirectiveResponseCreator(mutationsFields,subscriptionsFields,schema,asyncFieldSplitterOutput)
    

    if (asyncFieldSplitterOutput && asyncFieldSplitterOutput.length>0){


     gqlSchema = buildSchema(`${scalars}\n${directives}\n${newSchema}`);


      queriesFields = gqlSchema.getQueryType()?.getFields();
      mutationsFields = gqlSchema.getMutationType()?.getFields();
      introspection = introspectionFromSchema(gqlSchema);
  
      model.api.schema = introspection;
      model.api.queiresFields = [...Object.keys(queriesFields)];
      model.api.mutationFields = [...Object.keys(mutationsFields)];

    }


    model.api.schemaPath = `./editable_src/graphql/schema/schema.graphql`

    model.api.asyncFields = asyncFieldSplitterOutput



    fs.writeFileSync(
      `./editable_src/graphql/schema/schema.graphql`,
      `${scalars}\n${newSchema}`,
      (err: string) => {
        if (err) {
          stopSpinner(generatingCode, `Error: ${err}`, true);
          process.exit(1);
        }
      }
    );
   

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
    fse.copy(
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

  await CreateAspects({ config: model });

  // Codegenerator Function
  await generator(model, PanacloudConfig, 'init', dummyData);

  stopSpinner(generatingCode, "CDK Code Generated", false);

  const installingModules = startSpinner("Installing Modules");

  try {
    await exec(`npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  try {
    await exec(`cd editable_src/lambdaLayer/nodejs && npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  stopSpinner(installingModules, "Modules installed", false);
}

export default defineYourOwnApi;
