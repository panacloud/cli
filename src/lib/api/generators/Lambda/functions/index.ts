import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE, ARCHITECTURE, PanacloudconfigFile } from "../../../../../utils/constants";
import {
  Property,
  TypeScriptWriter,
} from "../../../../../utils/typescriptWriter";
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
  panacloudConfig: PanacloudconfigFile,
  model:ApiModel
) => {

  const {
    api: { apiName, apiType,mutationFields,generalFields,microServiceFields,architecture },
  } = model;

  const lambda = new Lambda(code, panacloudConfig);
  lambda.lambdaLayer(apiName);
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
    code.line(`this.${apiName}_lambdaFn = ${apiName}_lambdaFn`);
    code.line();
  } else {




    
    if (microServiceFields) {
      const microServices = Object.keys(microServiceFields);

      for (let i = 0; i < microServices.length; i++) {
        for (let j = 0; j < microServiceFields[microServices[i]].length; j++) {

          const key = microServiceFields[microServices[i]][j];
          const microService = microServices[i];


          
          const isMutation = mutationFields?.includes(key);


          if (architecture === ARCHITECTURE.eventDriven && isMutation) {


            
          lambda.initializeLambda(
            apiName,
            `${key}_consumer`,
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
            ,microService
          );
          code.line();
          code.line(
            `this.${apiName}_lambdaFn_${key}_consumerArn = ${apiName}_lambdaFn_${key}_consumer.functionArn`
          );
          code.line();
        

          }


          lambda.initializeLambda(
            apiName,
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
            ,microService
          );
          code.line();
          code.line(
            `this.${apiName}_lambdaFn_${key}Arn = ${apiName}_lambdaFn_${key}.functionArn`
          );
          code.line();

        }

      }


    }

    if (generalFields) {

      for (let i = 0; i < generalFields.length; i++) {

        const key = generalFields[i];


        const isMutation = mutationFields?.includes(key);


        if (architecture === ARCHITECTURE.eventDriven && isMutation) {


          
          lambda.initializeLambda(
            apiName,
            `${key}_consumer`,
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
            `this.${apiName}_lambdaFn_${key}_consumerArn = ${apiName}_lambdaFn_${key}_consumer.functionArn`
          );
          code.line();
      

        }

        lambda.initializeLambda(
          apiName,
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

      }

    }

  }
};

export const lambdaHandlerForNeptunedb = (
  code: CodeMaker,
  panacloudConfig: PanacloudconfigFile,
  model :ApiModel

) => {

  
  const {
    api: { apiName, apiType,mutationFields,generalFields,microServiceFields,architecture },
  } = model;

  const lambda = new Lambda(code, panacloudConfig);
  const ts = new TypeScriptWriter(code);
  lambda.lambdaLayer(apiName);
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
    code.line(`this.${apiName}_lambdaFnArn = ${apiName}_lambdaFn.functionArn`);
    if (apiType === APITYPE.rest)
      code.line(`this.${apiName}_lambdaFn = ${apiName}_lambdaFn`);
    code.line();
  } else {





    
    if (microServiceFields) {
      const microServices = Object.keys(microServiceFields);

      for (let i = 0; i < microServices.length; i++) {
        for (let j = 0; j < microServiceFields[microServices[i]].length; j++) {

          const key = microServiceFields[microServices[i]][j];
          const microService = microServices[i];




          const isMutation = mutationFields?.includes(key);


          if (architecture === ARCHITECTURE.eventDriven && isMutation) {


            lambda.initializeLambda(
              apiName,
              `${key}_consumer`,
              `props!.VPCRef`,
              `props!.SGRef`,
              [
                {
                  name: "NEPTUNE_ENDPOINT",
                  value: `props!.neptuneReaderEndpoint`,
                },
              ],
              `ec2.SubnetType.PRIVATE_ISOLATED`
            ,undefined,microService);
            code.line();
            code.line(
              `this.${apiName}_lambdaFn_${key}_consumerArn = ${apiName}_lambdaFn_${key}_consumer.functionArn`
            );
            code.line();
        

          }





          lambda.initializeLambda(
            apiName,
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
          ,undefined,microService);
          code.line();
          code.line(
            `this.${apiName}_lambdaFn_${key}Arn = ${apiName}_lambdaFn_${key}.functionArn`
          );
          code.line();

        }

      }


    }

    if (generalFields) {

      for (let i = 0; i < generalFields.length; i++) {

        const key = generalFields[i];



        const isMutation = mutationFields?.includes(key);


        if (architecture === ARCHITECTURE.eventDriven && isMutation) {


       
          lambda.initializeLambda(
            apiName,
            `${key}_consumer`,
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
            `this.${apiName}_lambdaFn_${key}_consumerArn = ${apiName}_lambdaFn_${key}_consumer.functionArn`
          );
          code.line();
      

        }



        lambda.initializeLambda(
          apiName,
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

      }

    }

  }
};

export const lambdaProperiesHandlerForAuroraDb = (
  apiName: string,
  apiType: string,
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
};

export const lambdaProperiesHandlerForDynoDb = (
  apiName: string,
  apiType: string,
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
  model:ApiModel
) => {


  const {
    api: { apiName, apiType,mutationFields,generalFields,microServiceFields,architecture },
  } = model;


  const lambda = new Lambda(code, panacloudConfig);
  lambda.lambdaLayer(apiName);
  if (apiType === APITYPE.rest) {
    lambda.initializeLambda(apiName, undefined, undefined, undefined, [
      { name: "TableName", value: "props!.tableName" },
    ]);
    code.line();
    code.line(`this.${apiName}_lambdaFn = ${apiName}_lambdaFn`);
  } else {



    if (microServiceFields) {
      const microServices = Object.keys(microServiceFields);

      for (let i = 0; i < microServices.length; i++) {
        for (let j = 0; j < microServiceFields[microServices[i]].length; j++) {

          const key = microServiceFields[microServices[i]][j];
          const microService = microServices[i];
          
          const isMutation = mutationFields?.includes(key);


          if (architecture === ARCHITECTURE.eventDriven && isMutation) {


              lambda.initializeLambda(apiName, `${key}_consumer`, undefined, undefined, [
                { name: "TableName", value: "props!.tableName" },
              ], undefined, undefined, microService);
              code.line();
              code.line(`this.${apiName}_lambdaFn_${key}_consumerArn = ${apiName}_lambdaFn_${key}_consumer.functionArn`);
              code.line();
        

          }


          lambda.initializeLambda(apiName, key, undefined, undefined, [
            { name: "TableName", value: "props!.tableName" },
          ], undefined, undefined, microService);
          code.line();
          code.line(`this.${apiName}_lambdaFn_${key} = ${apiName}_lambdaFn_${key}`);
          code.line();

        }

      }


    }

    if (generalFields) {

      for (let i = 0; i < generalFields.length; i++) {

        const key = generalFields[i];

        const isMutation = mutationFields?.includes(key);

        if (architecture === ARCHITECTURE.eventDriven && isMutation) {
    
          lambda.initializeLambda(apiName, `${key}_consumer`, undefined, undefined, [
            { name: "TableName", value: "props!.tableName" },
          ]);
          code.line();
          code.line(`this.${apiName}_lambdaFn_${key}_consumerArn = ${apiName}_lambdaFn_${key}_consumer.functionArn`);
          code.line();

    
      }
    

        lambda.initializeLambda(apiName, key, undefined, undefined, [
          { name: "TableName", value: "props!.tableName" },
        ]);
        code.line();
        code.line(`this.${apiName}_lambdaFn_${key} = ${apiName}_lambdaFn_${key}`);
        code.line();

      }

    }




  }
};