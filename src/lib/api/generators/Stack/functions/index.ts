import { Config } from "@oclif/config";
import { CodeMaker } from "codemaker";
import {
  API,
  APITYPE,
  ARCHITECTURE,
  DATABASE
} from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { DynamoDB } from "../../../constructs/Dynamodb";

export const importHandlerForStack = (
  database: string,
  apiType: string,
  architecture: ARCHITECTURE,
  code: CodeMaker
) => {
  const imp = new Imports(code);
  imp.importsForStack();
  imp.importsForConstructs();
  if (apiType === APITYPE.graphql) {
    imp.importForAppsyncConstruct();
  } else {
    imp.importForApiGatewayConstruct();
  }
  if (architecture === ARCHITECTURE.eventDriven) {
    imp.importForEventBrideConstruct();
  }

  databaseImportHandler(database, code);
  // imp.importApiManager();
  imp.importAspectController();
};

export const databaseImportHandler = (database: string, code: CodeMaker) => {
  const imp = new Imports(code);
  if (database === DATABASE.dynamoDB) {
    imp.importForDynamodbConstruct();
  }
  else if (database === DATABASE.neptuneDB) {
    imp.importForNeptuneConstruct();
  }
  else if (database === DATABASE.auroraDB) {
    imp.importForAuroraDbConstruct();
  }
};

export const LambdaAccessHandler = (
  code: CodeMaker,
  config:API
) => {
  const {apiType,apiName} = config
  const dynamodb = new DynamoDB(code);
  if (apiType === APITYPE.rest) {
    dynamodb.dbConstructLambdaAccess(
      apiName,
      `${apiName}_table`,
      `${apiName}Lambda`,
      apiType
    );
    code.line();
  } else {
    const {apiName,queiresFields,mutationFields,nestedResolver} = config
    let mutationsAndQueries = [...queiresFields!,...mutationFields!]
    if(nestedResolver){
      const {nestedResolverFieldsAndLambdas} = config
      const {nestedResolverLambdas} = nestedResolverFieldsAndLambdas!
      mutationsAndQueries = [...mutationsAndQueries,...nestedResolverLambdas]
    }
    mutationsAndQueries.forEach((key: string) => {
      dynamodb.dbConstructLambdaAccess(
        apiName,
        `${apiName}_table`,
        apiType,
        key
      );
    });
    code.line();
  }
};

export const propsHandlerForApiGatewayConstruct = (
  code: CodeMaker,
  apiName: string
) => {
  let lambdafunc = `${apiName}_lambdaFn`;
  code.line(`${lambdafunc}: ${apiName}Lambda.${lambdafunc}`);
};
