import { CodeMaker } from "codemaker";
import { ApiModel, async_response_mutName } from "../../../../../utils/constants";
import { Property } from "../../../../../utils/typescriptWriter";
import { Appsync } from "../../../constructs/Appsync";
import { Cdk } from "../../../constructs/Cdk";

export const appsyncDatasourceHandler = (config: ApiModel, code: CodeMaker) => {
  const {api: { apiName, mutationFields, queiresFields,nestedResolver,nestedResolverFieldsAndLambdas }} = config;
  const appsync = new Appsync(code);
  appsync.apiName = apiName;
  const mutationsAndQueries: string[] = [
    ...mutationFields!,
    ...queiresFields!,
  ];
    mutationsAndQueries.forEach((key: string) => {

      if (key !== async_response_mutName){
      
      appsync.appsyncLambdaDataSource(apiName, apiName, key);
      code.line();

    }

    else {
      appsync.appsyncNoneDataSource(key);
      code.line();
    }
    });

    if(nestedResolver && nestedResolverFieldsAndLambdas){

      const {nestedResolverLambdas} = nestedResolverFieldsAndLambdas!;
      nestedResolverLambdas.forEach((key: string) => {
        appsync.appsyncLambdaDataSource(apiName, apiName, key);
        code.line();
      });
    }
};

export const appsyncResolverhandler = (config: ApiModel, code: CodeMaker) => {
  const { api: { apiName, queiresFields, mutationFields , nestedResolver, nestedResolverFieldsAndLambdas} } = config;
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
    if (key !== async_response_mutName){
    appsync.appsyncLambdaResolver(key, "Mutation", dataSourceName);
    code.line();
    cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
    cdk.nodeAddDependency(`${key}_resolver`, dataSourceName);
    code.line();
    }
    else {
      appsync.appsyncNoneDataSourceResolver(key, "Mutation", dataSourceName);
      cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
      cdk.nodeAddDependency(`${key}_resolver`, dataSourceName);
    }
  });

  if(nestedResolver && nestedResolverFieldsAndLambdas){
    const {nestedResolverFields} = nestedResolverFieldsAndLambdas!   
    for( const key in nestedResolverFields){
      nestedResolverFields[key].forEach((resolver)=>{
        const {fieldName,lambda} = resolver
        const dataSourceName = `ds_${apiName}_${lambda}`
        appsync.appsyncLambdaResolver(resolver.fieldName,key,dataSourceName,nestedResolver)
        code.line()
        cdk.nodeAddDependency(`${key}_${fieldName}_resolver`, `${apiName}_schema`);
        cdk.nodeAddDependency(`${key}_${fieldName}_resolver`, dataSourceName);
        code.line()
      })
    }
     
  }

}




export const appsyncPropertiesHandler = (): Property[] => {
  return [
    {
      name: "api_url",
      typeName: "string",
      accessModifier: "public",
      isReadonly: false,
    },
    {
      name: "api_key",
      typeName: "string",
      accessModifier: "public",
      isReadonly: false,
    },
  ];
};


export const appsyncPropertiesInitializer = (
  apiName: string,
  code: CodeMaker
) => {
  //code.line(`this.api_url = ${apiName}_appsync.attrGraphQlUrl;`);
  //code.line(`this.api_key = ${apiName}_apiKey.attrApiKey;`);
  code.line(`new CfnOutput(this, "APIGraphQlURL", {
    value: ${apiName}_appsync.attrGraphQlUrl,
    description: 'The URL of the GraphQl API',
    exportName: 'graphQlAPIURL',

  });`);
  code.line(`new CfnOutput(this, "GraphQLAPIKey", {
    value: ${apiName}_apiKey.attrApiKey || '',
    description: 'The API Key of the GraphQl API',
    exportName: 'graphQlAPIKey',
  });`);
  
};
