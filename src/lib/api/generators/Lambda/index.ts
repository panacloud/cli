import {
  CONSTRUCTS,
  APITYPE,
  DATABASE,
  ApiModel,
  PanacloudconfigFile,
  ARCHITECTURE,
} from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { CodeMaker } from "codemaker";
import {
  lambdaHandlerForAuroradb,
  lambdaHandlerForDynamodb,
  lambdaHandlerForNeptunedb,
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
      architecture,
      nestedResolverFieldsAndLambdas,
      nestedResolver,
    },
  } = config;
  let mutationsAndQueries: string[] = [];
  let general_Fields: string[] = [];
  let microService_Fields: { [k: string]: any[] } = {};

  if (apiType === APITYPE.graphql) {
    const { queiresFields, mutationFields, generalFields, microServiceFields } =
      config.api;
    mutationsAndQueries = [...queiresFields!, ...mutationFields!];
    general_Fields = generalFields!;
    microService_Fields = microServiceFields!;
  }

  const lambda = new Lambda(code, panacloudConfig);

  if (!database) {
    lambda.lambdaLayer(apiName);
    const microServices = Object.keys(microService_Fields);
    for (let i = 0; i < microServices.length; i++) {
      for (let j = 0; j < microService_Fields[microServices[i]].length; j++) {
        const key = microService_Fields[microServices[i]][j];
        const microService = microServices[i];
        const isMutation = config.api.mutationFields?.includes(key);
        if (architecture === ARCHITECTURE.eventDriven && isMutation) {
          lambda.initializeLambda(
            apiName,
            `${key}_consumer`,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            microService
          );
        }

        lambda.initializeLambda(
          apiName,
          key,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          microService
        );
      }
    }
    for (let i = 0; i < general_Fields.length; i++) {
      const key = general_Fields[i];
      const isMutation = config.api.mutationFields?.includes(key);
      if (architecture === ARCHITECTURE.eventDriven && isMutation) {
        lambda.initializeLambda(apiName, `${key}_consumer`);
      }

      lambda.initializeLambda(apiName, key);
      code.line();
    }
  } else if (database === DATABASE.dynamoDB) {
    lambdaHandlerForDynamodb(code, panacloudConfig, config);
  } else if (database === DATABASE.neptuneDB) {
    lambdaHandlerForNeptunedb(code, panacloudConfig, config);
  } else if (database === DATABASE.auroraDB) {
    lambdaHandlerForAuroradb(code, panacloudConfig, config);
  }
};
