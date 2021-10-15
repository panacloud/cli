import { startSpinner, stopSpinner } from "../../../spinner";
import {
  writeFileAsync,
  copyFileAsync,
  mkdirRecursiveAsync,
} from "../../../fs";
import { contextInfo, generatePanacloudConfig } from "../../info";
import {
  Config,
  APITYPE,
  ApiModel,
  PanacloudconfigFile,
} from "../../../../utils/constants";
import { generator } from "../../generators";
import {
  introspectionFromSchema,
  buildSchema,
  GraphQLObjectType,
} from "graphql";
import { buildSchemaToTypescript } from "../../buildSchemaToTypescript";
import { EliminateScalarTypes, ScalarAndEnumKindFinder } from "../../helpers";
import { CreateAspects } from "../../generators/Aspects";
import { microServicesDirectiveFieldSplitter } from "../../microServicesDirective";
const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const exec = require("await-exec");
const fse = require("fs-extra");
const snakeCase = require("lodash/snakeCase");

async function defineYourOwnApi(config: Config, templateDir: string) {
  const { api_token, entityId } = config;

  const {
    api: { schemaPath, apiType, nestedResolver },
  } = config;

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
    await mkdirRecursiveAsync(`editable_src`);
    await mkdirRecursiveAsync(`editable_src/graphql`);
    await mkdirRecursiveAsync(`editable_src/graphql/schema`);
    //    await mkdirRecursiveAsync(`editable_src/aspects`);
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
      `./editable_src/graphql/schema/schema.graphql`,
      `${scalars}\n${schema}`,
      (err: string) => {
        if (err) {
          stopSpinner(generatingCode, `Error: ${err}`, true);
          process.exit(1);
        }
      }
    );

    const gqlSchema = buildSchema(`${scalars}\n${directives}\n${schema}`);
    const schemaJson = introspectionFromSchema(gqlSchema);
    let nestedResolverTypes: { [key: string]: string[] } = {};
    let schemaTypes: string[] = [];

    if (nestedResolver) {
      schemaJson.__schema.types.map((allTypes) => {
        if (EliminateScalarTypes(allTypes)) {
          if (ScalarAndEnumKindFinder(allTypes)) {
            const typeName = gqlSchema.getType(
              allTypes.name
            ) as GraphQLObjectType;
            const fieldsInType = typeName.getFields();
            let fieldsArray: string[] = [];
            for (const type in fieldsInType) {
              if (
                EliminateScalarTypes(
                  gqlSchema.getType(
                    fieldsInType[type].type.inspect().replace(/[[\]!]/g, "")
                  )
                )
              ) {
                const node = gqlSchema.getType(
                  fieldsInType[type].type.inspect().replace(/[[\]!]/g, "")
                )?.astNode;
                if (
                  node?.kind !==
                  ("EnumTypeDefinition" ||
                    "UnionTypeDefinition" ||
                    "InputObjectTypeDefinition")
                ) {
                  if (schemaTypes.indexOf(type) === -1) {
                    schemaTypes.push(type);
                  }
                  fieldsArray.push(type);
                  nestedResolverTypes[allTypes.name] = [...fieldsArray];
                }
              }
            }
          }
        }
      });
      if (Object.keys(nestedResolverTypes).length <= 0) {
        stopSpinner(
          generatingCode,
          "nested resolvers are not possible with this schema normal resolvers are created",
          false
        );
        model.api.nestedResolver = false;
      } else {
        model.api.nestedResolverTypes = nestedResolverTypes;
        model.api.schemaTypes = schemaTypes;
      }
    }

    // Model Config
    const queriesFields: any = gqlSchema.getQueryType()?.getFields();
    const mutationsFields: any = gqlSchema.getMutationType()?.getFields();
    const introspection = introspectionFromSchema(gqlSchema);
    model.api.schema = introspection;
    model.api.queiresFields = [...Object.keys(queriesFields)];
    model.api.mutationFields = [...Object.keys(mutationsFields)];
  
    const fieldSplitterOutput = microServicesDirectiveFieldSplitter(queriesFields,mutationsFields);
    
    model.api.generalFields = fieldSplitterOutput.generalFields;
    model.api.microServiceFields = fieldSplitterOutput.microServiceFields;

    if (apiType === APITYPE.graphql) {
      PanacloudConfig = await generatePanacloudConfig(model);

      const mockApiCollection = buildSchemaToTypescript(
        gqlSchema,
        introspection
      );
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
  await generator(model, PanacloudConfig);

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
