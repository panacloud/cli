import { CodeMaker } from "codemaker";
import { API, ApiModel, APITYPE, ARCHITECTURE, DATABASE, PanacloudconfigFile} from "../../../../../utils/constants";
import {Property,TypeScriptWriter} from "../../../../../utils/typescriptWriter";
import { Lambda } from "../../../constructs/Lambda";
interface Environment {
  name: string;
  value: string;
}

export const lambdaInitializerForNestedResolvers = (
  model: API,
  panacloudConfig: PanacloudconfigFile,
  code: CodeMaker
) => {
  const { nestedResolverFieldsAndLambdas, architecture, apiName,database } = model;
  const { nestedResolverLambdas } = nestedResolverFieldsAndLambdas!;
  const lambda = new Lambda(code, panacloudConfig);

  let lambdaEnv: Environment[] | undefined;
  let vpcRef:string | undefined;
  let securityGroupsRef : string | undefined;
  let vpcSubnets : string | undefined;
  let serviceRole : string | undefined;

  if (database && database === DATABASE.dynamoDB) {
    lambdaEnv = [{ name: "TableName", value: `props!.tableName` }];
  } else if (database === DATABASE.neptuneDB) {
    lambdaEnv = [{name: "NEPTUNE_ENDPOINT",value: `props!.neptuneReaderEndpoint`}];
    vpcSubnets = `ec2.SubnetType.PRIVATE_ISOLATED`;
    vpcRef = `props!.VPCRef`
    securityGroupsRef = `props!.SGRef`
  } else if (database === DATABASE.auroraDB) {
    vpcRef = `props!.vpcRef`;
    serviceRole = `props!.serviceRole`;
    lambdaEnv = [{name: "INSTANCE_CREDENTIALS",value: `props!.secretRef`}] 
  }

  for (let i = 0; i < nestedResolverLambdas.length; i++) {
    const key = nestedResolverLambdas[i];
    const isMutation = model.mutationFields?.includes(key);
    if (architecture === ARCHITECTURE.eventDriven && isMutation) {
      lambdaInitializerForEventDriven(model, panacloudConfig, key, code);
    }
    lambda.initializeLambda(apiName,key,vpcRef,securityGroupsRef,lambdaEnv,vpcSubnets,serviceRole,undefined,true);
    code.line();
    code.line();
  }
};

export const lambdaInitializerForMicroServices = (
  model: API,
  panacloudConfig: PanacloudconfigFile,
  code: CodeMaker
) => {
  let microService_Fields: { [k: string]: any[] } = {};
  const lambda = new Lambda(code, panacloudConfig);
  const { apiName, database, architecture, microServiceFields } = model;
  microService_Fields = microServiceFields!;
  const microServices = Object.keys(microService_Fields);
  let lambdaEnv: Environment[] | undefined;
  let vpcRef:string | undefined;
  let securityGroupsRef : string | undefined;
  let vpcSubnets : string | undefined;
  let serviceRole : string | undefined;

  if (database && database === DATABASE.dynamoDB) {
    lambdaEnv = [{ name: "TableName", value: `props!.tableName` }];
  } else if (database === DATABASE.neptuneDB) {
    lambdaEnv = [{name: "NEPTUNE_ENDPOINT",value: `props!.neptuneReaderEndpoint`}];
    vpcSubnets = `ec2.SubnetType.PRIVATE_ISOLATED`;
    vpcRef = `props!.VPCRef`
    securityGroupsRef = `props!.SGRef`
  } else if (database === DATABASE.auroraDB) {
    vpcRef = `props!.vpcRef`;
    serviceRole = `props!.serviceRole`;
    lambdaEnv = [{name: "INSTANCE_CREDENTIALS",value: `props!.secretRef`}] 
  }

  for (let i = 0; i < microServices.length; i++) {
    for (let j = 0; j < microService_Fields[microServices[i]].length; j++) {
      const key = microService_Fields[microServices[i]][j];
      const microService = microServices[i];
      const isMutation = model.mutationFields?.includes(key);
      if (architecture === ARCHITECTURE.eventDriven && isMutation) {
        lambdaInitializerForEventDriven(
          model,
          panacloudConfig,
          key,
          code,
          microService
        );     
      }
      lambda.initializeLambda(
        apiName,
        key,
        vpcRef,
        securityGroupsRef,
        lambdaEnv,
        vpcSubnets,
        serviceRole,
        microService
      );
      code.line();
    }
  }
};

export const lambdaInitializerForGeneralFields = (
  model: API,
  panacloudConfig: PanacloudconfigFile,
  code: CodeMaker,
  general_Fields: string[]
) => {
  const { architecture,database, apiName } = model;
  const lambda = new Lambda(code, panacloudConfig);
  
  let lambdaEnv: Environment[] | undefined;
  let vpcRef:string | undefined;
  let securityGroupsRef : string | undefined;
  let vpcSubnets : string | undefined;
  let serviceRole : string | undefined;

  if (database && database === DATABASE.dynamoDB) {
    lambdaEnv = [{ name: "TableName", value: `props!.tableName` }];
  } else if (database === DATABASE.neptuneDB) {
    lambdaEnv = [{name: "NEPTUNE_ENDPOINT",value: `props!.neptuneReaderEndpoint`}];
    vpcSubnets = `ec2.SubnetType.PRIVATE_ISOLATED`;
    vpcRef = `props!.VPCRef`
    securityGroupsRef = `props!.SGRef`
  } else if (database === DATABASE.auroraDB) {
    vpcRef = `props!.vpcRef`;
    serviceRole = `props!.serviceRole`;
    lambdaEnv = [{name: "INSTANCE_CREDENTIALS",value: `props!.secretRef`}] 
  }

  for (let i = 0; i < general_Fields.length; i++) {
    const key = general_Fields[i];
    const isMutation = model.mutationFields?.includes(key);
    if (architecture === ARCHITECTURE.eventDriven && isMutation) {
      lambdaInitializerForEventDriven(model, panacloudConfig, key, code);
    }
    lambda.initializeLambda(apiName,key,vpcRef,securityGroupsRef,lambdaEnv,vpcSubnets,serviceRole);
    code.line();
    code.line();
  }
};

export const lambdaInitializerForEventDriven = (
  model: API,
  panacloudConfig: PanacloudconfigFile,
  key: string,
  code: CodeMaker,
  microService?: string
) => {
  const { apiName,database } = model;
  const lambda = new Lambda(code, panacloudConfig);
  let lambdaEnv: Environment[] | undefined;
  let vpcRef:string | undefined;
  let securityGroupsRef : string | undefined;
  let vpcSubnets : string | undefined;
  let serviceRole : string | undefined;

  if (database && database === DATABASE.dynamoDB) {
    lambdaEnv = [{ name: "TableName", value: `props!.tableName` }];
  } else if (database === DATABASE.neptuneDB) {
    lambdaEnv = [{name: "NEPTUNE_ENDPOINT",value: `props!.neptuneReaderEndpoint`}];
    vpcSubnets = `ec2.SubnetType.PRIVATE_ISOLATED`;
    vpcRef = `props!.VPCRef`
    securityGroupsRef = `props!.SGRef`
  } else if (database === DATABASE.auroraDB) {
    vpcRef = `props!.vpcRef`;
    serviceRole = `props!.serviceRole`;
    lambdaEnv = [{name: "INSTANCE_CREDENTIALS",value: `props!.secretRef`}] 
  }

  lambda.initializeLambda(apiName,`${key}_consumer`,vpcRef,securityGroupsRef,lambdaEnv,vpcSubnets,serviceRole,microService ? microService : "");
  code.line();
  code.line();
};

export const lambdaProperiesHandlerForNestedResolver = (model: ApiModel) => {
  const {
    api: { database, apiName, nestedResolverFieldsAndLambdas },
  } = model;
  let nestedResolverLambdas: string[] = [];

  if (nestedResolverFieldsAndLambdas) {
    nestedResolverLambdas = nestedResolverFieldsAndLambdas!.nestedResolverLambdas;
  }
  let properties: Property[] = [];
  if (database === DATABASE.dynamoDB) {
    nestedResolverLambdas.forEach((key: string, index: number) => {
      properties.push({
        name: `${apiName}_lambdaFn_${key}`,
        typeName: "lambda.Function",
        accessModifier: "public",
        isReadonly: false,
      });
    });
  } else {
    nestedResolverLambdas.forEach((key: string) => {
      properties.push({
        name: `${apiName}_lambdaFn_${key}Arn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      });
    });
  }
  return properties;
};

export const lambdaPropsHandlerForNeptunedb = () => {
  let props: { name: string; type: string }[];
  return (props = [
    {
      name: "VPCRef",
      type: "ec2.Vpc",
    },
    {
      name: "SGRef",
      type: "ec2.SecurityGroup",
    },
    {
      name: "neptuneReaderEndpoint",
      type: "string",
    },
  ]);
};

export const lambdaPropsHandlerForAuroradb = () => {
  let props: { name: string; type: string }[];
  return (props = [
    {
      name: "vpcRef",
      type: "ec2.Vpc",
    },
    {
      name: "secretRef",
      type: "string",
    },
    {
      name: "serviceRole",
      type: "iam.Role",
    },
  ]);
};

export const lambdaHandlerForAuroradb = (
  code: CodeMaker,
  panacloudConfig: PanacloudconfigFile,
  model: ApiModel
) => {
  const {
    api: {
      apiName,
      apiType,
      mutationFields,
      generalFields,
      microServiceFields,
      architecture,
      nestedResolver,
      database,
    },
  } = model;
  const lambda = new Lambda(code, panacloudConfig);
  lambda.lambdaLayer(apiName, panacloudConfig.mockData["asset_path"]);
  if (apiType === APITYPE.rest) {
    lambda.initializeLambda(
      apiName,
      undefined,
      `props!.vpcRef`,
      undefined,
      [
        {
          name: "INSTANCE_CREDENTIALS",
          value: `props!.secretRef`,
        },
      ],
      undefined,
      `props!.serviceRole`
    );
    code.line();
  } else {
    if (microServiceFields) {
      lambdaInitializerForMicroServices(model.api,panacloudConfig,code)
    }

    if (generalFields) {
      lambdaInitializerForGeneralFields(model.api,panacloudConfig,code,generalFields)
      if (nestedResolver) {
        lambdaInitializerForNestedResolvers(model.api,panacloudConfig,code)
      }
    }
  }
};

export const lambdaHandlerForNeptunedb = (
  code: CodeMaker,
  panacloudConfig: PanacloudconfigFile,
  model: ApiModel
) => {
  const {
    api: {
      apiName,
      apiType,
      mutationFields,
      generalFields,
      microServiceFields,
      architecture,
      nestedResolver,
      nestedResolverFieldsAndLambdas,
    },
  } = model;
  let nestedResolverLambdas: string[] = [];
  if (nestedResolverFieldsAndLambdas) {
    nestedResolverLambdas =
      nestedResolverFieldsAndLambdas!.nestedResolverLambdas;
  }

  const lambda = new Lambda(code, panacloudConfig);
  const ts = new TypeScriptWriter(code);
  lambda.lambdaLayer(apiName, panacloudConfig.mockData["asset_path"]);
  if (apiType === APITYPE.rest) {
    lambda.initializeLambda(
      apiName,
      undefined,
      `props!.VPCRef`,
      `props!.SGRef`,
      [
        {
          name: "NEPTUNE_ENDPOINT",
          value: `props!.neptuneReaderEndpoint`,
        },
      ],
      `ec2.SubnetType.PRIVATE_ISOLATED`
    );
    code.line();
  } else {
    if (microServiceFields) {
      lambdaInitializerForMicroServices(model.api,panacloudConfig,code)
    }

    if (generalFields) {
      lambdaInitializerForGeneralFields(model.api,panacloudConfig,code,generalFields)
      if (nestedResolver) {
        lambdaInitializerForNestedResolvers(model.api,panacloudConfig,code)
      }
    }
  }
};

export const lambdaProperiesHandlerForAuroraDb = (
  apiName: string,
  apiType: string,
  mutationsAndQueries?: any
) => {
  let properties: Property[] = [];
  if (apiType === APITYPE.graphql) {
    mutationsAndQueries.forEach((key: string, index: number) => {
      properties[index] = {
        name: `${apiName}_lambdaFn_${key}Arn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      };
    });
  }
  return properties;
};

export const lambdaProperiesHandlerForNeptuneDb = (
  apiName: string,
  apiType: string,
  mutationsAndQueries: any
) => {
  let properties: Property[] = [];
  if (apiType === APITYPE.graphql) {
    mutationsAndQueries.forEach((key: string, index: number) => {
      properties[index] = {
        name: `${apiName}_lambdaFn_${key}Arn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      };
    });
  }
  return properties;
};

export const lambdaProperiesHandlerForMockApi = (
  apiName: string,
  apiType: string,
  mutationsAndQueries: any
) => {
  let properties: Property[] = [];
  if (apiType === APITYPE.graphql) {
    mutationsAndQueries.forEach((key: string, index: number) => {
      properties[index] = {
        name: `${apiName}_lambdaFn_${key}Arn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      };
    });
  }
  return properties;
};

export const lambdaProperiesHandlerForDynoDb = (
  apiName: string,
  apiType: string,
  mutationsAndQueries: any
) => {
  let properties: Property[] = [];
  if (apiType === APITYPE.graphql) {
    mutationsAndQueries.forEach((key: string, index: number) => {
      properties[index] = {
        name: `${apiName}_lambdaFn_${key}`,
        typeName: "lambda.Function",
        accessModifier: "public",
        isReadonly: false,
      };
    });
  }
  return properties;
};

export const lambdaHandlerForDynamodb = (
  code: CodeMaker,
  panacloudConfig: PanacloudconfigFile,
  model: ApiModel
) => {
  const {
    api: {
      apiName,
      apiType,
      mutationFields,
      generalFields,
      microServiceFields,
      architecture,
      nestedResolver,
      nestedResolverFieldsAndLambdas,
    },
  } = model;
  let nestedResolverLambdas: string[] = [];
  if (nestedResolverFieldsAndLambdas) {
    nestedResolverLambdas =
      nestedResolverFieldsAndLambdas!.nestedResolverLambdas;
  }
  const lambda = new Lambda(code, panacloudConfig);
  lambda.lambdaLayer(apiName, panacloudConfig.mockData["asset_path"]);
  if (apiType === APITYPE.rest) {
    lambda.initializeLambda(apiName, undefined, undefined, undefined, [
      { name: "TableName", value: "props!.tableName" },
    ]);
    code.line();
  } else {
    if (microServiceFields) {
      lambdaInitializerForMicroServices(model.api, panacloudConfig, code);
    }
    if (generalFields) {
      lambdaInitializerForGeneralFields(model.api,panacloudConfig,code,generalFields)
      if (nestedResolver) {
        lambdaInitializerForNestedResolvers(model.api,panacloudConfig,code)
      }
    }
  }
};
