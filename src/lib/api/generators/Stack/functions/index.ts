import { Config } from "@oclif/config";
import { CodeMaker } from "codemaker";
import {
  API,
  APITYPE,
  async_response_mutName,
  DATABASE,
} from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { DynamoDB } from "../../../constructs/Dynamodb";
import { Rds } from "../../../constructs/Rds";

export const importHandlerForStack = (
  database: string,
  apiType: string,
  code: CodeMaker,
  asyncFields?: string[]
) => {
  const imp = new Imports(code);
  imp.importsForStack();
  imp.importsForConstructs();
  if (apiType === APITYPE.graphql) {
    imp.importForAppsyncConstruct();
  } else {
    imp.importForApiGatewayConstruct();
  }
  if (asyncFields && asyncFields.length > 0) {
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
  } else if (database === DATABASE.neptuneDB) {
    imp.importForNeptuneConstruct();
  } else if (database === DATABASE.auroraDB) {
    imp.importForAuroraDbConstruct();
  } else if (database === DATABASE.rds) {
    imp.importForRdsConstruct();
  }
};

export const DynamoDBLambdaAccessHandler = (code: CodeMaker, config: API) => {
  const { apiType, apiName } = config;
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
    const { apiName, queiresFields, mutationFields, nestedResolver } = config;
    let mutationsAndQueries = [...queiresFields!, ...mutationFields!];
    if (nestedResolver) {
      const { nestedResolverFieldsAndLambdas } = config;
      const { nestedResolverLambdas } = nestedResolverFieldsAndLambdas!;
      mutationsAndQueries = [...mutationsAndQueries, ...nestedResolverLambdas];
    }
    mutationsAndQueries.forEach((key: string) => {
      if (key !== async_response_mutName) {
        dynamodb.dbConstructLambdaAccess(
          apiName,
          `${apiName}_table`,
          apiType,
          key
        );
      }
    });

    code.line();
  }
};
export const RdsLambdaAccessHandler = (code: CodeMaker, config: API) => {
  const { apiType, apiName } = config;
  const rds = new Rds(code);
  const cdk = new Cdk(code);
  if (apiType === APITYPE.rest) {
    rds.dbConstructLambdaAccess(
      apiName,
      `${apiName}_rds.db_instance`,
      `${apiName}Lambda`,
      apiType
    );
    cdk.nodeAddDependency(`${apiName}Lambda`, `${apiName}_rds.db_cluster`);
  } else {
    const { apiName, queiresFields, mutationFields, nestedResolver } = config;
    let mutationsAndQueries = [...queiresFields!, ...mutationFields!];
    if (nestedResolver) {
      const { nestedResolverFieldsAndLambdas } = config;
      const { nestedResolverLambdas } = nestedResolverFieldsAndLambdas!;
      mutationsAndQueries = [...mutationsAndQueries, ...nestedResolverLambdas];
    }
    mutationsAndQueries.forEach((key: string) => {
      if (key !== async_response_mutName) {
        rds.dbConstructLambdaAccess(
          apiName,
          `${apiName}_rds.db_instance`,
          apiType,
          key
        );
        cdk.nodeAddDependency(
          `${apiName}_lambdaFn_${key}`,
          `${apiName}_rds.db_instance`
        );
      }
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
