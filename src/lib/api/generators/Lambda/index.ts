import {
  APITYPE,
  DATABASE,
  ApiModel,
  PanacloudconfigFile,
} from "../../../../utils/constants";
import { CodeMaker } from "codemaker";
import {
  lambdaHandlerForAuroradb,
  lambdaHandlerForDynamodb,
  lambdaHandlerForNeptunedb,
  lambdaHandlerForRds,
  lambdaInitializerForGeneralFields,
  lambdaInitializerForMicroServices,
  lambdaInitializerForNestedResolvers,
} from "./functions";
import { Lambda } from "../../constructs/Lambda";

export const LambdaConstructFile = async (
  config: ApiModel,
  panacloudConfig: PanacloudconfigFile,
  code: CodeMaker
) => {
  const {
    api: {
      apiName,
      apiType,
      database,
      nestedResolver
    }
  } = config;
  let mutationsAndQueries: string[] = [];
  let general_Fields: string[] = [];
  let microService_Fields: { [k: string]: unknown[] } = {};

  if (apiType === APITYPE.graphql) {
    const { queiresFields, mutationFields, generalFields, microServiceFields} = config.api;
    mutationsAndQueries = [...queiresFields!, ...mutationFields!];
    general_Fields = generalFields!;
    microService_Fields = microServiceFields!;
  }
  
  const lambda = new Lambda(code, panacloudConfig);

  if (database === DATABASE.none) {
    lambda.lambdaLayer(apiName, "editable_src/lambdaLayer");
    lambda.mockLambdaLayer(apiName, false);
    lambdaInitializerForMicroServices(config.api,panacloudConfig,code)
    lambdaInitializerForGeneralFields(config.api,panacloudConfig,code,general_Fields)
    if(nestedResolver){
      lambdaInitializerForNestedResolvers(config.api,panacloudConfig,code)
    }
  } else if (database === DATABASE.dynamoDB) {
    lambdaHandlerForDynamodb(code, panacloudConfig, config);
  } else if (database === DATABASE.neptuneDB) {
    lambdaHandlerForNeptunedb(code, panacloudConfig, config);
  } else if (database === DATABASE.auroraDB) {
    lambdaHandlerForAuroradb(code, panacloudConfig, config);
  } else if(database === DATABASE.rds){
    lambdaHandlerForRds(code, panacloudConfig, config)
  }
};
