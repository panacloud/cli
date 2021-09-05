import { CodeMaker } from "codemaker";
import { LAMBDASTYLE } from "../../../../../utils/constants";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import { Appsync } from "../../../constructs/Appsync";
import { Cdk } from "../../../constructs/Cdk";

export const appsyncDatasourceHandler = (
    apiName: string,
    lambdaStyle: string,
    code: CodeMaker,
    mutationsAndQueries: any
  ) => {
    const appsync = new Appsync(code);
    appsync.apiName = apiName;
    if (lambdaStyle === LAMBDASTYLE.single) {
      appsync.appsyncLambdaDataSource(apiName, apiName, lambdaStyle);
    } else if (lambdaStyle === LAMBDASTYLE.multi) {
      Object.keys(mutationsAndQueries).forEach((key) => {
        appsync.appsyncLambdaDataSource(
          apiName,
          apiName,
          lambdaStyle,
          key
        );
        code.line();
      });
    } else {
       code.line();
    }
  };
  
  export const appsyncResolverhandler = (
    apiName: string,
    lambdaStyle: string,
    code: CodeMaker,
    schema:any
  ) => {
    const appsync = new Appsync(code);
    appsync.apiName = apiName;
    const cdk = new Cdk(code);
    if (schema?.Query) {
      for (var key in schema?.Query) {
        if (lambdaStyle === LAMBDASTYLE.single) {
          appsync.appsyncLambdaResolver(key, "Query", `ds_${apiName}`);
          code.line();
          cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
          cdk.nodeAddDependency(`${key}_resolver`, `ds_${apiName}`);
          code.line();
        } else if (lambdaStyle === LAMBDASTYLE.multi) {
          appsync.appsyncLambdaResolver(
            key,
            "Query",
            `ds_${apiName}_${key}`,
          );
        code.line();
          cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
          cdk.nodeAddDependency(`${key}_resolver`, `ds_${apiName}_${key}`);
        code.line();
        }
      }
        code.line();
    }
  
    if (schema?.Mutation) {
      for (var key in schema?.Mutation) {
        if (lambdaStyle === LAMBDASTYLE.single) {
          appsync.appsyncLambdaResolver(key, "Mutation", `ds_${apiName}`);
        code.line();
          cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
          cdk.nodeAddDependency(`${key}_resolver`, `ds_${apiName}`);
        code.line();
        } else if (lambdaStyle === LAMBDASTYLE.multi) {
          appsync.appsyncLambdaResolver(
            key,
            "Mutation",
            `ds_${apiName}_${key}`,
          );
          code.line();
          cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
          cdk.nodeAddDependency(`${key}_resolver`, `ds_${apiName}_${key}`);
          code.line();
        }
      }
        code.line();
    }
  };
  