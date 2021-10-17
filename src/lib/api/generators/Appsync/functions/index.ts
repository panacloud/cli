import { CodeMaker } from "codemaker";
import { ApiModel } from "../../../../../utils/constants";
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
      appsync.appsyncLambdaDataSource(apiName, apiName, key);
      code.line();
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
    appsync.appsyncLambdaResolver(key, "Mutation", dataSourceName);
    code.line();
    cdk.nodeAddDependency(`${key}_resolver`, `${apiName}_schema`);
    cdk.nodeAddDependency(`${key}_resolver`, dataSourceName);
    code.line();
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
    
    // for (const [key, value] of Object.entries(nestedResolverTypes!)) {
    //   let dataSourceName = `ds_${apiName}_${value[0]}`;
    //   if(value.length > 1){
    //     value.forEach((val)=>{
    //       dataSourceName = `ds_${apiName}_${val}`;
    //       appsync.appsyncLambdaResolver(val, key, dataSourceName, nestedResolver);
    //       code.line();
    //       cdk.nodeAddDependency(`${key}_${val}_resolver`, `${apiName}_schema`);
    //       cdk.nodeAddDependency(`${key}_${val}_resolver`, dataSourceName);
    //       code.line();      
    //     })
    //   }else{
    //     appsync.appsyncLambdaResolver( value[0] , key, dataSourceName, nestedResolver);
    //     code.line();
    //     cdk.nodeAddDependency(`${key}_${value[0]}_resolver`, `${apiName}_schema`);
    //     cdk.nodeAddDependency(`${key}_${value[0]}_resolver`, dataSourceName);
    //     code.line();      
    //   }
    // }    
  }

}