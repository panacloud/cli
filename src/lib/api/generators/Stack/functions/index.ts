import { CodeMaker } from "codemaker";
import {
  APITYPE,
  DATABASE
} from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { DynamoDB } from "../../../constructs/Dynamodb";

export const importHandlerForStack = (
  database: string,
  apiType: string,
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
  imp.importForLambdaConstruct();
  databaseImportHandler(database, code);
  imp.importApiManager();
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
  apiName: string,
  apiType: string,
  mutationsAndQueries: any
) => {
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
    mutationsAndQueries.forEach((key: string) => {
      dynamodb.dbConstructLambdaAccess(
        apiName,
        `${apiName}_table`,
        `${apiName}Lambda`,
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
