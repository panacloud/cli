import { CodeMaker } from "codemaker";
import { ApiModel, ARCHITECTURE, LAMBDASTYLE } from "../../../../../utils/constants";
import { Appsync } from "../../../constructs/Appsync";
import { Cdk } from "../../../constructs/Cdk";

export const appsyncDatasourceHandler = (
  config: ApiModel,
  code: CodeMaker,
) => {
  const {api: {apiName, lambdaStyle, architecture, mutationFields, queiresFields }} = config;
  const appsync = new Appsync(code);
  appsync.apiName = apiName;
  if (lambdaStyle === LAMBDASTYLE.single) {
    appsync.appsyncLambdaDataSource(apiName, apiName, lambdaStyle);
  } else if (lambdaStyle === LAMBDASTYLE.multi) {
    if(architecture === ARCHITECTURE.eventDriven) {
      appsync.appsyncLambdaDataSource(apiName, apiName, lambdaStyle, "eventProducer");
      code.line();
      queiresFields!.forEach((key: string) => {
        appsync.appsyncLambdaDataSource(apiName, apiName, lambdaStyle, key);
        code.line();
      })
    }
    else {
      const mutationsAndQueries: string[] = [...mutationFields!, ...queiresFields!];
      mutationsAndQueries.forEach((key: string) => {
        appsync.appsyncLambdaDataSource(apiName, apiName, lambdaStyle, key);
        code.line();
      });
    }

  } else {
    code.line();
  }
};

export const appsyncResolverhandler = (
  config: ApiModel,
  code: CodeMaker,
) => {
  const {api: { apiName, lambdaStyle, queiresFields, mutationFields, architecture }} = config;
  const appsync = new Appsync(code);
  appsync.apiName = apiName;
  const cdk = new Cdk(code);

  queiresFields!.forEach((key: string) => {
    let dataSourceName = `ds_${apiName}`;
    if (lambdaStyle === LAMBDASTYLE.multi) {
      dataSourceName = `ds_${apiName}_${key}`;
    }
    appsync.appsyncLambdaResolver(key, "Query", dataSourceName);
    code.line();
    cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
    cdk.nodeAddDependency(`${key}_resolver`, dataSourceName);
    code.line();
  });


  mutationFields!.forEach((key: string) => {
    let dataSourceName = `ds_${apiName}`;
    if (lambdaStyle === LAMBDASTYLE.multi) {
      if(architecture === ARCHITECTURE.eventDriven) {
        dataSourceName = `ds_${apiName}_eventProducer`;
      }
      else {
        dataSourceName = `ds_${apiName}_${key}`;
      }
      
    }
    appsync.appsyncLambdaResolver(key, "Mutation", dataSourceName);
    code.line();
    cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
    cdk.nodeAddDependency(`${key}_resolver`, dataSourceName);
    code.line();
  });

};
