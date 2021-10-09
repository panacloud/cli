import { CodeMaker } from "codemaker";
import { ApiModel } from "../../../../../utils/constants";
import { Appsync } from "../../../constructs/Appsync";
import { Cdk } from "../../../constructs/Cdk";

export const appsyncDatasourceHandler = (config: ApiModel, code: CodeMaker) => {
  const {
    api: { apiName, mutationFields, queiresFields },
  } = config;
  const appsync = new Appsync(code);
  appsync.apiName = apiName;

    const mutationsAndQueries: string[] = [
      ...mutationFields!,
      ...queiresFields!,
    ];
    mutationsAndQueries.forEach((key: string) => {
      appsync.appsyncLambdaDataSource(apiName, apiName, key);
      code.line();
    });

};

export const appsyncResolverhandler = (config: ApiModel, code: CodeMaker) => {
  const {
    api: { apiName, queiresFields, mutationFields },
  } = config;
  const appsync = new Appsync(code);
  appsync.apiName = apiName;
  const cdk = new Cdk(code);

  queiresFields!.forEach((key: string) => {
    const dataSourceName = `ds_${apiName}_${key}`;
    appsync.appsyncLambdaResolver(key, "Query", dataSourceName);
    code.line();
    cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
    cdk.nodeAddDependency(`${key}_resolver`, dataSourceName);
    code.line();
  });

  mutationFields!.forEach((key: string) => {
    const dataSourceName = `ds_${apiName}_${key}`;
    appsync.appsyncLambdaResolver(key, "Mutation", dataSourceName);
    code.line();
    cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
    cdk.nodeAddDependency(`${key}_resolver`, dataSourceName);
    code.line();
  });
};
