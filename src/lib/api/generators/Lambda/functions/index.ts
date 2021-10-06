import { CodeMaker } from "codemaker";
import {
  APITYPE,
  ARCHITECTURE,
  LAMBDASTYLE,
} from "../../../../../utils/constants";
import {
  Property,
  TypeScriptWriter,
} from "../../../../../utils/typescriptWriter";
import { EventBridge } from "../../../constructs/EventBridge";
import { Lambda } from "../../../constructs/Lambda";

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
  lambdaStyle: LAMBDASTYLE,
  architecture: ARCHITECTURE,
  apiType: string,
  apiName: string,
  mutationsAndQueries: any,
  mockApi?: boolean
) => {
  const lambda = new Lambda(code);
  const ts = new TypeScriptWriter(code);
  lambda.lambdaLayer(apiName);
  if (
    (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.single) ||
    apiType === APITYPE.rest
  ) {
    lambda.initializeLambda(
      apiName,
      lambdaStyle,
      mockApi,
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
    code.line(`this.${apiName}_lambdaFnArn = ${apiName}_lambdaFn.functionArn`);
    if (apiType === APITYPE.rest)
      code.line(`this.${apiName}_lambdaFn = ${apiName}_lambdaFn`);
    code.line();
  } else if (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.multi) {
    if (architecture === ARCHITECTURE.eventDriven) {
      const eventBridge = new EventBridge(code);
      lambda.initializeLambda(
        apiName,
        lambdaStyle,
        mockApi,
        "eventProducer",
        undefined,
        undefined,
        undefined
      );
      code.line();
      eventBridge.grantPutEvents(apiName);
      code.line(
        `this.${apiName}_lambdaFn_eventProducerArn = ${apiName}_lambdaFn_eventProducer.functionArn`
      );
      code.line();
    }
    mutationsAndQueries.forEach((key: string) => {
      lambda.initializeLambda(
        apiName,
        lambdaStyle,
        mockApi,
        key,
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
      code.line(
        `this.${apiName}_lambdaFn_${key}Arn = ${apiName}_lambdaFn_${key}.functionArn`
      );
      code.line();
    });
  }
};

export const lambdaHandlerForNeptunedb = (
  code: CodeMaker,
  lambdaStyle: LAMBDASTYLE,
  architecture: ARCHITECTURE,
  apiType: string,
  apiName: string,
  mutationsAndQueries: any,
  mockApi?:boolean,
) => {
  const lambda = new Lambda(code);
  const ts = new TypeScriptWriter(code);
  lambda.lambdaLayer(apiName);
  if (
    (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.single) ||
    apiType === APITYPE.rest
  ) {
    lambda.initializeLambda(
      apiName,
      lambdaStyle,
      mockApi,
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
    code.line(`this.${apiName}_lambdaFnArn = ${apiName}_lambdaFn.functionArn`);
    if (apiType === APITYPE.rest)
      code.line(`this.${apiName}_lambdaFn = ${apiName}_lambdaFn`);
    code.line();
  } else if (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.multi) {
    if (architecture === ARCHITECTURE.eventDriven) {
      const eventBridge = new EventBridge(code);
      lambda.initializeLambda(
        apiName,
        lambdaStyle,
        mockApi,
        "eventProducer",
        undefined,
        undefined,
        undefined
      );
      code.line();
      eventBridge.grantPutEvents(apiName);
      code.line(
        `this.${apiName}_lambdaFn_eventProducerArn = ${apiName}_lambdaFn_eventProducer.functionArn`
      );
      code.line();
    }
    mutationsAndQueries.forEach((key: string) => {
      lambda.initializeLambda(
        apiName,
        lambdaStyle,
        mockApi,
        key,
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
      code.line(
        `this.${apiName}_lambdaFn_${key}Arn = ${apiName}_lambdaFn_${key}.functionArn`
      );
      code.line();
    });
  }
};

export const lambdaProperiesHandlerForAuroraDb = (
  apiName: string,
  apiType: string,
  lambdaStyle: string,
  architecture: ARCHITECTURE,
  mutationsAndQueries?: any
) => {
  let properties: Property[] = [
    {
      name: `${apiName}_lambdaFnArn`,
      typeName: "string",
      accessModifier: "public",
      isReadonly: false,
    },
    {
      name: `${apiName}_lambdaFn`,
      typeName: "lambda.Function",
      accessModifier: "public",
      isReadonly: false,
    },
  ];
  // if (
  //   ((lambdaStyle === LAMBDASTYLE.single && apiType === APITYPE.graphql) ||
  //     apiType === APITYPE.rest) &&
  //   database === DATABASE.auroraDB
  // ) {
  //   properties = [
  //     {
  //       name: `${apiName}_lambdaFnArn`,
  //       typeName: "string",
  //       accessModifier: "public",
  //       isReadonly: true,
  //     },
  //     {
  //       name: `${apiName}_lambdaFn`,
  //       typeName: "lambda.Function",
  //       accessModifier: "public",
  //       isReadonly: false,
  //     },
  //   ];
  //   return properties;
  // }
  if (lambdaStyle === LAMBDASTYLE.multi && apiType === APITYPE.graphql) {
    mutationsAndQueries.forEach((key: string, index: number) => {
      properties[index] = {
        name: `${apiName}_lambdaFn_${key}Arn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      };
    });
    if (architecture === ARCHITECTURE.eventDriven) {
      properties.push({
        name: `${apiName}_lambdaFn_eventProducerArn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      });
    }
  }
  return properties;
};

export const lambdaProperiesHandlerForNeptuneDb = (
  apiName: string,
  apiType: string,
  lambdaStyle: string,
  architecture: ARCHITECTURE,
  mutationsAndQueries: any
) => {
  let properties: Property[] = [
    {
      name: `${apiName}_lambdaFnArn`,
      typeName: "string",
      accessModifier: "public",
      isReadonly: false,
    },
    {
      name: `${apiName}_lambdaFn`,
      typeName: "lambda.Function",
      accessModifier: "public",
      isReadonly: false,
    },
  ];
  // if (
  //   ((lambdaStyle === LAMBDASTYLE.single && apiType === APITYPE.graphql) ||
  //     apiType === APITYPE.rest) &&
  //   database === DATABASE.neptuneDB
  // ) {
  //   properties = [
  //     {
  //       name: `${apiName}_lambdaFnArn`,
  //       typeName: "string",
  //       accessModifier: "public",
  //       isReadonly: true,
  //     },
  //     {
  //       name: `${apiName}_lambdaFn`,
  //       typeName: "lambda.Function",
  //       accessModifier: "public",
  //       isReadonly: false,
  //     },
  //   ];
  //   return properties;
  // }
  if (lambdaStyle === LAMBDASTYLE.multi && apiType === APITYPE.graphql) {
    mutationsAndQueries.forEach((key: string, index: number) => {
      properties[index] = {
        name: `${apiName}_lambdaFn_${key}Arn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      };
    });
    if (architecture === ARCHITECTURE.eventDriven) {
      properties.push({
        name: `${apiName}_lambdaFn_eventProducerArn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      });
    }
  }
  return properties;
};

export const lambdaProperiesHandlerForMockApi = (
  apiName: string,
  apiType: string,
  lambdaStyle: string,
  architecture: ARCHITECTURE,
  mutationsAndQueries: any
) => {
  if (lambdaStyle) {
    let properties: Property[] = [
      {
        name: `${apiName}_lambdaFnArn`,
        typeName: "string",
        accessModifier: "public",
        isReadonly: true,
      },
      {
        name: `${apiName}_lambdaFn`,
        typeName: "lambda.Function",
        accessModifier: "public",
        isReadonly: false,
      },
    ];
    // if (
    //   (lambdaStyle === LAMBDASTYLE.single && apiType === APITYPE.graphql) ||
    //   apiType === APITYPE.rest
    // ) {
    //   return properties;
    // }

    if (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.multi) {
      mutationsAndQueries.forEach((key: string, index: number) => {
        properties[index] = {
          name: `${apiName}_lambdaFn_${key}Arn`,
          typeName: "string",
          accessModifier: "public",
          isReadonly: true,
        };
      });
      if (architecture === ARCHITECTURE.eventDriven) {
        properties.push({
          name: `${apiName}_lambdaFn_eventProducerArn`,
          typeName: "string",
          accessModifier: "public",
          isReadonly: true,
        });
      }
    }
    return properties;

    // if (
    //   lambdaStyle === LAMBDASTYLE.multi &&
    //   apiType === APITYPE.graphql
    // ) {
    //   mutationsAndQueries.forEach((key: string, index: number) => {
    //     properties[index] = {
    //       name: `${apiName}_lambdaFn_${key}Arn`,
    //       typeName: "string",
    //       accessModifier: "public",
    //       isReadonly: true,
    //     };
    //   });
    //   return properties;
    // }
  }
};

export const lambdaProperiesHandlerForDynoDb = (
  lambdaStyle: string,
  apiName: string,
  apiType: string,
  architecture: ARCHITECTURE,
  mutationsAndQueries: any
) => {
  let properties: Property[] = [
    {
      name: `${apiName}_lambdaFn`,
      typeName: "lambda.Function",
      accessModifier: "public",
      isReadonly: false,
    },
  ];
  // if (
  //   (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.single) ||
  //   apiType === APITYPE.rest
  // ) {
  //   properties = [
  //     {
  //       name: `${apiName}_lambdaFn`,
  //       typeName: "lambda.Function",
  //       accessModifier: "public",
  //       isReadonly: false,
  //     },
  //   ];
  //   return properties;
  // }
  if (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.multi) {
    mutationsAndQueries.forEach((key: string, index: number) => {
      properties[index] = {
        name: `${apiName}_lambdaFn_${key}`,
        typeName: "lambda.Function",
        accessModifier: "public",
        isReadonly: false,
      };
    });
    if (architecture === ARCHITECTURE.eventDriven) {
      properties.push({
        name: `${apiName}_lambdaFn_eventProducer`,
        typeName: "lambda.Function",
        accessModifier: "public",
        isReadonly: false,
      });
    }
  }
  return properties;
};

export const lambdaHandlerForDynamodb = (
  code: CodeMaker,
  apiName: string,
  apiType: string,
  lambdaStyle: string,
  architecture: ARCHITECTURE,
  mutationsAndQueries?: any,
  mockApi?: boolean
) => {
  const lambda = new Lambda(code);
  lambda.lambdaLayer(apiName);
  if (
    (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.single) ||
    apiType === APITYPE.rest
  ) {
    lambda.initializeLambda(
      apiName,
      lambdaStyle,
      mockApi,
      undefined,
      undefined,
      undefined,
      [{ name: "TableName", value: "props!.tableName" }]
    );
    code.line();
    code.line(`this.${apiName}_lambdaFn = ${apiName}_lambdaFn`);
  } else if (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.multi) {
    if (architecture === ARCHITECTURE.eventDriven) {
      const eventBridge = new EventBridge(code)
      lambda.initializeLambda(
        apiName,
        lambdaStyle,
        mockApi,
        "eventProducer",
        undefined,
        undefined,
        undefined
      );
      code.line();
      eventBridge.grantPutEvents(apiName);
      code.line(
        `this.${apiName}_lambdaFn_eventProducerArn = ${apiName}_lambdaFn_eventProducer.functionArn`
      );
      code.line();
      code.line(`this.${apiName}_lambdaFn = ${apiName}_lambdaFn`);
    }
  } else if (apiType === APITYPE.graphql && lambdaStyle === LAMBDASTYLE.multi) {
      mutationsAndQueries.forEach((key: string) => {
        lambda.initializeLambda(
          apiName,
          lambdaStyle,
          mockApi,
          key,
          undefined,
          undefined,
          [{ name: "TableName", value: "props!.tableName" }]
        );
        code.line();
        code.line(
          `this.${apiName}_lambdaFn_${key} = ${apiName}_lambdaFn_${key}`
        );
        code.line();
      });
  } else {
    code.line();
  }
};
