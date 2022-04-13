import { CodeMaker } from "codemaker";
import {
  API,
  ApiModel,
  APITYPE,
  ARCHITECTURE,
  async_response_mutName,
  DATABASE,
  PanacloudconfigFile,
} from "../../../../../utils/constants";
import { Property } from "../../../../../utils/typescriptWriter";
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
  const { nestedResolverFieldsAndLambdas, apiName, database, asyncFields } =
    model;
  const { nestedResolverLambdas } = nestedResolverFieldsAndLambdas!;
  const lambda = new Lambda(code, panacloudConfig);

  let lambdaEnv: Environment[] | undefined;
  let vpcRef: string | undefined;
  let securityGroupsRef: string | undefined;
  let vpcSubnets: string | undefined;
  let serviceRole: string | undefined;

  if (database && database === DATABASE.dynamoDB) {
    lambdaEnv = [
      { name: "TableName", value: `${apiName}_table.table.tableName` },
    ];
  } else if (database === DATABASE.neptuneDB) {
    lambdaEnv = [
      {
        name: "NEPTUNE_ENDPOINT",
        value: `${apiName}_neptunedb.neptuneReaderEndpoint`,
      },
    ];
    vpcSubnets = `ec2.SubnetType.PRIVATE_ISOLATED`;
    vpcRef = `${apiName}_neptunedb.VPCRef`;
    securityGroupsRef = `${apiName}_neptunedb.SGRef`;
  } else if (database === DATABASE.auroraDB) {
    vpcRef = `${apiName}_auroradb.vpcRef`;
    serviceRole = `${apiName}_auroradb.serviceRole`;
    lambdaEnv = [
      { name: "SECRET_ARN", value: `${apiName}_auroradb.SECRET_ARN` },
      { name: "CLUSTER_ARN", value: `${apiName}_auroradb.CLUSTER_ARN` },
      { name: "DB_NAME", value: `${apiName}_auroradb.DB_NAME` },
    ];
  } else if (database === DATABASE.rds) {
    vpcRef = `${apiName}_rds.VPCRef`;
    serviceRole = `${apiName}_rds.serviceRole`;
    lambdaEnv = [
      { name: "INSTANCE_CREDENTIALS", value: `${apiName}_rds.SECRET_ARN` },
    ];
  }

  for (let i = 0; i < nestedResolverLambdas.length; i++) {
    const key = nestedResolverLambdas[i];
    if (asyncFields && asyncFields.includes(key)) {
      lambdaInitializerForEventDriven(model, panacloudConfig, key, code);
    }
    lambda.initializeLambda(
      database,
      apiName,
      key,
      vpcRef,
      securityGroupsRef,
      lambdaEnv,
      vpcSubnets,
      serviceRole,
      undefined,
      true
    );
    code.line();
    code.line();
  }
};

export const lambdaInitializerForMicroServices = (
  model: API,
  panacloudConfig: PanacloudconfigFile,
  code: CodeMaker
) => {
  let microService_Fields: { [k: string]: string[] } = {};
  const lambda = new Lambda(code, panacloudConfig);
  const { apiName, database, microServiceFields, asyncFields } = model;
  microService_Fields = microServiceFields!;
  const microServices = Object.keys(microService_Fields);
  let lambdaEnv: Environment[] | undefined;
  let vpcRef: string | undefined;
  let securityGroupsRef: string | undefined;
  let vpcSubnets: string | undefined;
  let serviceRole: string | undefined;

  if (database && database === DATABASE.dynamoDB) {
    lambdaEnv = [
      { name: "TableName", value: `${apiName}_table.table.tableName` },
    ];
  } else if (database === DATABASE.neptuneDB) {
    lambdaEnv = [
      {
        name: "NEPTUNE_ENDPOINT",
        value: `${apiName}_neptunedb.neptuneReaderEndpoint`,
      },
    ];
    vpcSubnets = `ec2.SubnetType.PRIVATE_ISOLATED`;
    vpcRef = `${apiName}_neptunedb.VPCRef`;
    securityGroupsRef = `${apiName}_neptunedb.SGRef`;
  } else if (database === DATABASE.auroraDB) {
    vpcRef = `${apiName}_auroradb.vpcRef`;
    serviceRole = `${apiName}_auroradb.serviceRole`;
    lambdaEnv = [
      { name: "SECRET_ARN", value: `${apiName}_auroradb.SECRET_ARN` },
      { name: "CLUSTER_ARN", value: `${apiName}_auroradb.CLUSTER_ARN` },
      { name: "DB_NAME", value: `${apiName}_auroradb.DB_NAME` },
    ];
  } else if (database === DATABASE.rds) {
    vpcRef = `${apiName}_rds.VPCRef`;
    serviceRole = `${apiName}_rds.serviceRole`;
    lambdaEnv = [
      { name: "INSTANCE_CREDENTIALS", value: `${apiName}_rds.SECRET_ARN` },
    ];
  }

  for (let i = 0; i < microServices.length; i++) {
    for (let j = 0; j < microService_Fields[microServices[i]].length; j++) {
      const key = microService_Fields[microServices[i]][j];
      const microService = microServices[i];

      if (key !== async_response_mutName) {
        if (asyncFields && asyncFields.includes(key)) {
          lambdaInitializerForEventDriven(
            model,
            panacloudConfig,
            key,
            code,
            microService
          );
        }
        lambda.initializeLambda(
          database,
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
  }
};

export const lambdaInitializerForGeneralFields = (
  model: API,
  panacloudConfig: PanacloudconfigFile,
  code: CodeMaker,
  general_Fields: string[]
) => {
  const { database, apiName, asyncFields } = model;
  const lambda = new Lambda(code, panacloudConfig);

  let lambdaEnv: Environment[] | undefined;
  let vpcRef: string | undefined;
  let securityGroupsRef: string | undefined;
  let vpcSubnets: string | undefined;
  let serviceRole: string | undefined;

  if (database && database === DATABASE.dynamoDB) {
    lambdaEnv = [
      { name: "TableName", value: `${apiName}_table.table.tableName` },
    ];
  } else if (database === DATABASE.neptuneDB) {
    lambdaEnv = [
      {
        name: "NEPTUNE_ENDPOINT",
        value: `${apiName}_neptunedb.neptuneReaderEndpoint`,
      },
    ];
    vpcSubnets = `ec2.SubnetType.PRIVATE_ISOLATED`;
    vpcRef = `${apiName}_neptunedb.VPCRef`;
    securityGroupsRef = `${apiName}_neptunedb.SGRef`;
  } else if (database === DATABASE.auroraDB) {
    vpcRef = `${apiName}_auroradb.vpcRef`;
    serviceRole = `${apiName}_auroradb.serviceRole`;
    lambdaEnv = [
      { name: "SECRET_ARN", value: `${apiName}_auroradb.SECRET_ARN` },
      { name: "CLUSTER_ARN", value: `${apiName}_auroradb.CLUSTER_ARN` },
      { name: "DB_NAME", value: `${apiName}_auroradb.DB_NAME` },
    ];
  } else if (database === DATABASE.rds) {
    vpcRef = `${apiName}_rds.VPCRef`;
    serviceRole = `${apiName}_rds.serviceRole`;
    lambdaEnv = [
      { name: "INSTANCE_CREDENTIALS", value: `${apiName}_rds.SECRET_ARN` },
    ];
  }

  for (let i = 0; i < general_Fields.length; i++) {
    const key = general_Fields[i];

    if (key !== async_response_mutName) {
      if (asyncFields && asyncFields.includes(key)) {
        lambdaInitializerForEventDriven(model, panacloudConfig, key, code);
      }
      lambda.initializeLambda(
        database,
        apiName,
        key,
        vpcRef,
        securityGroupsRef,
        lambdaEnv,
        vpcSubnets,
        serviceRole
      );
      code.line();
      code.line();
    }
  }
};

export const lambdaInitializerForEventDriven = (
  model: API,
  panacloudConfig: PanacloudconfigFile,
  key: string,
  code: CodeMaker,
  microService?: string
) => {
  const { apiName, database } = model;
  const lambda = new Lambda(code, panacloudConfig);
  let lambdaEnv: Environment[] | undefined;
  let vpcRef: string | undefined;
  let securityGroupsRef: string | undefined;
  let vpcSubnets: string | undefined;
  let serviceRole: string | undefined;

  if (database && database === DATABASE.dynamoDB) {
    lambdaEnv = [
      { name: "TableName", value: `${apiName}_table.table.tableName` },
    ];
  } else if (database === DATABASE.neptuneDB) {
    lambdaEnv = [
      {
        name: "NEPTUNE_ENDPOINT",
        value: `${apiName}_neptunedb.neptuneReaderEndpoint`,
      },
    ];
    vpcSubnets = `ec2.SubnetType.PRIVATE_ISOLATED`;
    vpcRef = `${apiName}_neptunedb.VPCRef`;
    securityGroupsRef = `${apiName}_neptunedb.SGRef`;
  } else if (database === DATABASE.auroraDB) {
    vpcRef = `${apiName}_auroradb.vpcRef`;
    serviceRole = `${apiName}_auroradb.serviceRole`;
    lambdaEnv = [
      { name: "SECRET_ARN", value: `${apiName}_auroradb.SECRET_ARN` },
      { name: "CLUSTER_ARN", value: `${apiName}_auroradb.CLUSTER_ARN` },
      { name: "DB_NAME", value: `${apiName}_auroradb.DB_NAME` },
    ];
  }

  lambda.initializeLambda(
    database,
    apiName,
    `${key}_consumer`,
    vpcRef,
    securityGroupsRef,
    lambdaEnv,
    vpcSubnets,
    serviceRole,
    microService ? microService : ""
  );
  code.line();
  code.line();
};

export const lambdaProperiesHandlerForNestedResolver = (model: ApiModel) => {
  const {
    api: { database, apiName, nestedResolverFieldsAndLambdas },
  } = model;
  let nestedResolverLambdas: string[] = [];

  if (nestedResolverFieldsAndLambdas) {
    nestedResolverLambdas =
      nestedResolverFieldsAndLambdas!.nestedResolverLambdas;
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
      generalFields,
      microServiceFields,
      nestedResolver,
    },
  } = model;
  const lambda = new Lambda(code, panacloudConfig);
  lambda.lambdaLayer(apiName, "editable_src/lambdaLayer");
  lambda.mockLambdaLayer(apiName, panacloudConfig.mockData!["is_custom"]);
  if (apiType === APITYPE.rest) {
    lambda.initializeLambda(
      "",
      apiName,
      undefined,
      `${apiName}_auroradb.vpcRef`,
      undefined,
      [
        {
          name: "INSTANCE_CREDENTIALS",
          value: `${apiName}_auroradb.secretRef`,
        },
      ],
      undefined,
      `${apiName}_auroradb.serviceRole`
    );
    code.line();
  } else {
    if (microServiceFields) {
      lambdaInitializerForMicroServices(model.api, panacloudConfig, code);
    }

    if (generalFields) {
      lambdaInitializerForGeneralFields(
        model.api,
        panacloudConfig,
        code,
        generalFields
      );
      if (nestedResolver) {
        lambdaInitializerForNestedResolvers(model.api, panacloudConfig, code);
      }
    }
  }
};
export const lambdaHandlerForRds = (
  code: CodeMaker,
  panacloudConfig: PanacloudconfigFile,
  model: ApiModel
) => {
  const {
    api: {
      apiName,
      apiType,
      generalFields,
      microServiceFields,
      nestedResolver,
    },
  } = model;
  const lambda = new Lambda(code, panacloudConfig);
  lambda.lambdaLayer(apiName, "editable_src/lambdaLayer");
  lambda.mockLambdaLayer(apiName, panacloudConfig.mockData!["is_custom"]);
  if (apiType === APITYPE.rest) {
    lambda.initializeLambda(
      "",
      apiName,
      undefined,
      `${apiName}_rds.VPCRef`,
      undefined,
      [
        {
          name: "INSTANCE_CREDENTIALS",
          value: `${apiName}_rds.SECRET_ARN`,
        },
      ],
      undefined,
      `${apiName}_rds.serviceRole`
    );
    code.line();
  } else {
    if (microServiceFields) {
      lambdaInitializerForMicroServices(model.api, panacloudConfig, code);
    }

    if (generalFields) {
      lambdaInitializerForGeneralFields(
        model.api,
        panacloudConfig,
        code,
        generalFields
      );
      if (nestedResolver) {
        lambdaInitializerForNestedResolvers(model.api, panacloudConfig, code);
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
      generalFields,
      microServiceFields,
      nestedResolver,
    },
  } = model;

  const lambda = new Lambda(code, panacloudConfig);
  lambda.lambdaLayer(apiName, "editable_src/lambdaLayer");
  lambda.mockLambdaLayer(apiName, panacloudConfig.mockData!["is_custom"]);
  if (apiType === APITYPE.rest) {
    lambda.initializeLambda(
      "",
      apiName,
      undefined,
      `${apiName}_neptunedb.VPCRef`,
      `${apiName}_neptunedb.SGRef`,
      [
        {
          name: "NEPTUNE_ENDPOINT",
          value: `${apiName}_neptunedb.neptuneReaderEndpoint`,
        },
      ],
      `ec2.SubnetType.PRIVATE_ISOLATED`
    );
    code.line();
  } else {
    if (microServiceFields) {
      lambdaInitializerForMicroServices(model.api, panacloudConfig, code);
    }
    if (generalFields) {
      lambdaInitializerForGeneralFields(
        model.api,
        panacloudConfig,
        code,
        generalFields
      );
      if (nestedResolver) {
        lambdaInitializerForNestedResolvers(model.api, panacloudConfig, code);
      }
    }
  }
};

export const lambdaProperiesHandlerForAuroraDb = (
  apiName: string,
  apiType: string,
  mutationsAndQueries?: string[]
) => {
  let properties: Property[] = [];
  if (apiType === APITYPE.graphql) {
    mutationsAndQueries!.forEach((key: string, index: number) => {
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
  mutationsAndQueries: string[]
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
  mutationsAndQueries: string[]
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
  mutationsAndQueries: string[]
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
      generalFields,
      microServiceFields,
      nestedResolver,
    },
  } = model;
  const lambda = new Lambda(code, panacloudConfig);
  lambda.lambdaLayer(apiName, "editable_src/lambdaLayer");
  lambda.mockLambdaLayer(apiName, panacloudConfig.mockData!["is_custom"]);

  if (apiType === APITYPE.rest) {
    lambda.initializeLambda("", apiName, undefined, undefined, undefined, [
      { name: "TableName", value: `${apiName}_table.tableName` },
    ]);
    code.line();
  } else {
    if (microServiceFields) {
      lambdaInitializerForMicroServices(model.api, panacloudConfig, code);
    }
    if (generalFields) {
      lambdaInitializerForGeneralFields(
        model.api,
        panacloudConfig,
        code,
        generalFields
      );
      if (nestedResolver) {
        lambdaInitializerForNestedResolvers(model.api, panacloudConfig, code);
      }
    }
  }
};
