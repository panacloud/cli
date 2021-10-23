import { startSpinner, stopSpinner } from "../../../spinner";

import { contextInfo, generatePanacloudConfig, updatePanacloudConfig } from "../../info";
import {
    Config,
    APITYPE,
    ApiModel,
    PanacloudconfigFile
    // LAMBDASTYLE,
} from "../../../../utils/constants";
import { generator } from "../../generators";
import { introspectionFromSchema, buildSchema } from "graphql";
import { buildSchemaToTypescript } from "../../buildSchemaToTypescript";
import { microServicesDirectiveFieldSplitter } from "../../microServicesDirective";
import { FieldsAndLambdaForNestedResolver } from "../../helpers";

const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const exec = require("await-exec");
const fse = require("fs-extra");
const _ = require("lodash");


async function updateYourOwnApi(config: Config, spinner:any) {


    const workingDir = _.snakeCase(path.basename(process.cwd()));

    const model: ApiModel = {
        api: {
            ...config.api,
        },
        workingDir: workingDir,
    };

    let directivesPath = path.resolve(
        __dirname,
        "../../../../utils/awsAppsyncDirectives.graphql"
      );
  
      let scalarPath = path.resolve(
        __dirname,
        "../../../../utils/awsAppsyncScalars.graphql"
      );

    let schema = fs.readFileSync(config.api.schemaPath, "utf8", (err: string) => {
        if (err) {
            stopSpinner(spinner, `Error: ${err}`, true);
            process.exit(1);
        }
    });

    let directives = fs.readFileSync(directivesPath, "utf8", (err: string) => {
        if (err) {
          stopSpinner(spinner, `Error: ${err}`, true);
          process.exit(1);
        }
      });
  
      let scalars = fs.readFileSync(scalarPath, "utf8", (err: string) => {
        if (err) {
          stopSpinner(spinner, `Error: ${err}`, true);
          process.exit(1);
        }
      });

    const gqlSchema = buildSchema(`${directives}\n${schema}`);

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


    const mockApiCollection = buildSchemaToTypescript(gqlSchema, introspection);
    model.api.mockApiData = mockApiCollection;
    
    if (model.api.nestedResolver) {
      const fieldsAndLambdas = FieldsAndLambdaForNestedResolver(model,gqlSchema)
      if (Object.keys(fieldsAndLambdas.nestedResolverFields).length <= 0) {
        stopSpinner(
          spinner,
          "nested resolvers are not possible with this schema normal resolvers are created",
          false
        );
        model.api.nestedResolver = false;
      } else {
          model.api.nestedResolverFieldsAndLambdas = fieldsAndLambdas
      }
    }

    const updatedPanacloudConfig = await updatePanacloudConfig(
      model,
        spinner,
    );


    // Codegenerator Function
    await generator(model, updatedPanacloudConfig, 'update');

}

export default updateYourOwnApi;
