import { CodeMaker } from "codemaker";
import {
  APITYPE,
  CONSTRUCTS,
  DATABASE,
  PanacloudconfigFile
} from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
const fse = require("fs-extra");

interface Environment {
  name: string;
  value: string;
}


export class Lambda {
  code: CodeMaker;
  panacloudConfig: PanacloudconfigFile
  // configPanacloud: PanacloudconfigFile = fse.readJsonSync('editable_src/panacloudconfig.json')
  constructor(_code: CodeMaker, panacloudConfig: PanacloudconfigFile) {
    this.code = _code;
    this.panacloudConfig = panacloudConfig;

  }

  public initializeLambda(
    apiName: string,
    functionName?: string,
    vpcName?: string,
    securityGroupsName?: string,
    environments?: Environment[],
    vpcSubnets?: string,
    roleName?: string,
    microServiceName?:string,
    nestedResolver?:boolean
  ) {
    const ts = new TypeScriptWriter(this.code);
    let handlerName: string
    let handlerAsset: string
    let lambdaConstructName: string = functionName? `${apiName}Lambda${functionName}` : `${apiName}Lambda`;
    let lambdaVariable: string = functionName? `${apiName}_lambdaFn_${functionName}` : `${apiName}_lambdaFn`;
    let funcName: string = functionName?  `${apiName}Lambda${functionName}` : `${apiName}Lambda`;
    if(functionName){      
      const {lambdas} = this.panacloudConfig;
      if (microServiceName){
        const handlerfile = lambdas[microServiceName][functionName].asset_path.split("/")[lambdas[microServiceName][functionName].asset_path.split("/").length - 1].split('.')[0];
        handlerName = functionName? `${handlerfile}.handler` : "main.handler";
        const splitPath = lambdas[microServiceName][functionName].asset_path.split("/");
        splitPath.pop();
        handlerAsset = functionName? splitPath.join("/") : "lambda";
      }
      else{
        if(nestedResolver){
          const {nestedLambdas} = this.panacloudConfig;
          const handlerfile = nestedLambdas[functionName].asset_path.split("/")[nestedLambdas[functionName].asset_path.split("/").length - 1].split('.')[0];
          handlerName = functionName? `${handlerfile}.handler` : "main.handler";
          const splitPath = nestedLambdas[functionName].asset_path.split("/");
          splitPath.pop();
          handlerAsset = functionName? splitPath.join("/") : "lambda";
        }
        else{
          const handlerfile = lambdas[functionName].asset_path.split("/")[lambdas[functionName].asset_path.split("/").length - 1].split('.')[0];
          handlerName = functionName? `${handlerfile}.handler` : "main.handler";
          const splitPath = lambdas[functionName].asset_path.split("/");
          splitPath.pop();
          handlerAsset = functionName? splitPath.join("/") : "lambda";
        }
      }
    }
    let vpc = vpcName ? `vpc: ${vpcName},` : "";
    let securityGroups = securityGroupsName
      ? `securityGroups: [${securityGroupsName}],`
      : "";
    let env = environments
      ? `environment: {${environments.map((v) => `${v.name}: ${v.value}`)}},`
      : "";
    let vpcSubnet = vpcSubnets
      ? `vpcSubnets: { subnetType: ${vpcSubnets} },`
      : "";
    let role = roleName ? `role: ${roleName},` : "";
    let lambdaLayer = `layers:[${apiName}_lambdaLayer],`;

    ts.writeVariableDeclaration(
      {
        name: lambdaVariable,
        typeName: "lambda.Function",
        initializer: () => {
          this.code.line(`new lambda.Function(this, "${funcName}", {
        functionName: "${funcName}",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "${handlerName}",
        code: lambda.Code.fromAsset("${handlerAsset}"),
        ${lambdaLayer}
        ${role}
        ${vpc}
        ${securityGroups}
        ${env}
        ${vpcSubnet}
        })`);
        },
      },
      "const"
    );
  }

  public lambdaLayer(apiName: string, path: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_lambdaLayer`,
        typeName: "lambda.LayerVersion",
        initializer: () => {
          this.code
            .line(`new lambda.LayerVersion(this, "${apiName}LambdaLayer", {
          code: lambda.Code.fromAsset("${path}"),
        })`);
        },
      },
      "const"
    );
  }

  public lambdaConstructInitializer(apiName: string, database: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}Lambda`,
        typeName: CONSTRUCTS.lambda,
        initializer: () => {
          this.code.line(
            `new ${CONSTRUCTS.lambda}(this,"${apiName}${CONSTRUCTS.lambda}"`
          );
          if (database === DATABASE.dynamoDB) {
            this.code.line(",{");
            this.code.line(`tableName:${apiName}_table.table.tableName`);
            this.code.line("}");
          } else if (database === DATABASE.neptuneDB) {
            this.code.line(",{");
            this.code.line(`SGRef:${apiName}_neptunedb.SGRef,`);
            this.code.line(`VPCRef:${apiName}_neptunedb.VPCRef,`);
            this.code.line(
              `neptuneReaderEndpoint:${apiName}_neptunedb.neptuneReaderEndpoint`
            );
            this.code.line("}");
          } else if (database === DATABASE.auroraDB) {
            this.code.line(",{");
            this.code.line(`secretRef:${apiName}_auroradb.secretRef,`);
            this.code.line(`vpcRef:${apiName}_auroradb.vpcRef,`);
            this.code.line(`serviceRole: ${apiName}_auroradb.serviceRole`);
            this.code.line("}");
          }
          this.code.line(")");
        },
      },
      "const"
    );
  }

  public lambdaTestConstructInitializer(
    database: string,
    code: CodeMaker
  ) {
    const ts = new TypeScriptWriter(code);
    ts.writeVariableDeclaration(
      {
        name: `${CONSTRUCTS.lambda}_stack`,
        typeName: "",
        initializer: () => {
          this.code.line(
            `new ${CONSTRUCTS.lambda}(stack, "${CONSTRUCTS.lambda}Test"`
          );
          if (database === DATABASE.dynamoDB) {
            code.line(",{");
            code.line(
              `tableName: ${CONSTRUCTS.dynamoDB}_stack.table.tableName`
            );
            code.line("}");
          } else if (database === DATABASE.neptuneDB) {
            code.line(",{");
            code.line(`SGRef: ${CONSTRUCTS.neptuneDB}_stack.SGRef,`);
            code.line(`VPCRef: ${CONSTRUCTS.neptuneDB}_stack.VPCRef,`);
            code.line(
              `neptuneReaderEndpoint: ${CONSTRUCTS.neptuneDB}_stack.neptuneReaderEndpoint`
            );
            this.code.line("}");
          } else if (database === DATABASE.auroraDB) {
            code.line(",{");
            code.line(`secretRef: ${CONSTRUCTS.auroraDB}_stack.secretRef,`);
            code.line(`vpcRef: ${CONSTRUCTS.auroraDB}_stack.vpcRef,`);
            code.line(`serviceRole: ${CONSTRUCTS.auroraDB}_stack.serviceRole`);
            this.code.line("}");
          }
          this.code.line(")");
        },
      },
      "const"
    );
  }

  public addEnvironment(
    lambda: string,
    envName: string,
    value: string,
    functionName: string
  ) {
      this.code.line(
        `${lambda}_lambdaFn_${functionName}.addEnvironment("${envName}", ${value});`
      );
    
  }

  public initializeTestForLambdaWithDynamoDB(
    funcName: string,
    handlerName: string
  ) {
    this.code.line(`expect(stack).toHaveResource("AWS::Lambda::Function", {
      FunctionName: "${funcName}",
      Handler: "${handlerName}.handler",
      Runtime: "nodejs12.x",
      Environment: {
        Variables: {
          TableName: {
            Ref: stack.getLogicalId(
              db_table[0].node.defaultChild as cdk.CfnElement
            ),
          },
        },
      },
    })
`);
  }

  public initializeTestForLambdaWithNeptune(
    funcName: string,
    handlerName: string
  ) {
    this.code.line(`expect(stack).toHaveResource('AWS::Lambda::Function', {
    FunctionName: '${funcName}',
    Handler: '${handlerName}.handler',
    Runtime: 'nodejs12.x',
    Environment: {
      Variables: {
        NEPTUNE_ENDPOINT: {
          'Fn::GetAtt': [
            stack.getLogicalId(cfn_cluster[0] as cdk.CfnElement),
            'ReadEndpoint',
          ],
        },
      },
    },
    VpcConfig: {
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            stack.getLogicalId(${CONSTRUCTS.neptuneDB}_stack.SGRef.node.defaultChild as cdk.CfnElement),
            'GroupId',
          ],
        },
      ],
      SubnetIds: [
        {
          Ref: stack.getLogicalId(isolated_subnets[0].node.defaultChild as cdk.CfnElement),
        },
        {
          Ref: stack.getLogicalId(isolated_subnets[1].node.defaultChild as cdk.CfnElement),
        },
      ],
    },
  });
`);
  }

  public initializeTestForLambdaWithAuroradb(
    funcName: string,
    handlerName: string
  ) {
    this.code.line(`expect(stack).toHaveResource('AWS::Lambda::Function', {
    FunctionName: '${funcName}',
    Handler: '${handlerName}.handler',
    Runtime: 'nodejs12.x',
    Environment: {
      Variables: {
        INSTANCE_CREDENTIALS: {
          Ref: stack.getLogicalId(secretAttachment[0].node.defaultChild as cdk.CfnElement),
        },
      },
    },
  });`);
  }
}
