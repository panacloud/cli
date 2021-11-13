import { stopSpinner } from "../../../spinner";
import { updatePanacloudConfig } from "../../info";
import { Config, ApiModel } from "../../../../utils/constants";
import { generator } from "../../generators";
import { introspectionFromSchema, buildSchema } from "graphql";
import { buildSchemaToTypescript } from "../../buildSchemaToTypescript";
import { microServicesDirectiveFieldSplitter } from "../../directives/microServicesDirective";
import { FieldsAndLambdaForNestedResolver } from "../../helpers";
import { RootMockObject, TestCollectionType } from "../../apiMockDataGenerator";
import { AsyncDirective, asyncDirectiveFieldSplitter, asyncDirectiveResponseCreator } from "../../directives/asyncDirective";

const path = require("path");
const fs = require("fs");
const snakeCase = require("lodash/snakeCase");

async function updateYourOwnApi(config: Config, spinner: any) {
  const workingDir = snakeCase(path.basename(process.cwd()));
  const { schemaPath } = config.api;

  const model: ApiModel = {
    api: {
      ...config.api,
    },
    workingDir: workingDir,
  };

  const dummyData: TestCollectionType = { fields: {} };


  let directivesPath = path.resolve(
    __dirname,
    "../../../../utils/awsAppsyncDirectives.graphql"
  );

  let scalarPath = path.resolve(
    __dirname,
    "../../../../utils/awsAppsyncScalars.graphql"
  );

  let schema = fs.readFileSync(schemaPath, "utf8", (err: string) => {
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

  let gqlSchema = buildSchema(`${directives}\n${schema}`);

  let mockObject = new RootMockObject(gqlSchema);
  mockObject.write(dummyData);

  // Model Config
  let queriesFields: any = gqlSchema.getQueryType()?.getFields();
  let mutationsFields: any = gqlSchema.getMutationType()?.getFields();
  let subscriptionsFields: any = gqlSchema.getSubscriptionType()?.getFields();
  let introspection = introspectionFromSchema(gqlSchema);
  model.api.schema = introspection;
  model.api.queiresFields = [...Object.keys(queriesFields)];
  model.api.mutationFields = [...Object.keys(mutationsFields)];

  const microServicesfieldSplitterOutput = microServicesDirectiveFieldSplitter(
    queriesFields,
    mutationsFields
  );

  model.api.generalFields = microServicesfieldSplitterOutput.generalFields;
  model.api.microServiceFields = microServicesfieldSplitterOutput.microServiceFields;


 const asyncFieldSplitterOutput = asyncDirectiveFieldSplitter(mutationsFields)

 const newSchema = asyncDirectiveResponseCreator(mutationsFields,subscriptionsFields,schema,asyncFieldSplitterOutput)
 

 
 if (asyncFieldSplitterOutput && asyncFieldSplitterOutput.length>0){


  gqlSchema = buildSchema(`${directives}\n${newSchema}`);


   queriesFields = gqlSchema.getQueryType()?.getFields();
   mutationsFields = gqlSchema.getMutationType()?.getFields();
   introspection = introspectionFromSchema(gqlSchema);

   model.api.schema = introspection;
   model.api.queiresFields = [...Object.keys(queriesFields)];
   model.api.mutationFields = [...Object.keys(mutationsFields)];

 }


 fs.writeFileSync(
  `./editable_src/graphql/schema/schema.graphql`,
  `${newSchema}`,
  (err: string) => {
    if (err) {
      stopSpinner(spinner, `Error: ${err}`, true);
      process.exit(1);
    }
  }
);

 model.api.asyncFields = asyncFieldSplitterOutput

  const mockApiCollection = buildSchemaToTypescript(gqlSchema, introspection);
  model.api.mockApiData = mockApiCollection;

  if (model.api.nestedResolver) {
    const fieldsAndLambdas = FieldsAndLambdaForNestedResolver(model, gqlSchema);
    if (Object.keys(fieldsAndLambdas.nestedResolverFields).length <= 0) {
      stopSpinner(
        spinner,
        "Nested Resolvers Are Not Possible With This Schema Normal Resolvers Are Created",
        true
      );
      model.api.nestedResolver = false;
    } else {
      model.api.nestedResolverFieldsAndLambdas = fieldsAndLambdas;
    }
  }

    // Codegenerator Function
  const updatedPanacloudConfig = await updatePanacloudConfig(model, spinner);

  // Codegenerator Function
  await generator(model, updatedPanacloudConfig, 'update', dummyData);
}

export default updateYourOwnApi;
