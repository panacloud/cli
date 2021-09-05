import { CodeMaker } from "codemaker";
import { LAMBDASTYLE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

interface Environment {
  name: string;
  value: string;
}

export class Lambda {
  code: CodeMaker;
  constructor(_code: CodeMaker){
    this.code = _code
  }

  public initializeLambda(
    apiName: string,
    lambdaStyle: string,
    functionName?: string,
    vpcName?: string,
    securityGroupsName?: string,
    environments?: Environment[],
    vpcSubnets?: string,
    roleName?: string
  ) {
    const ts = new TypeScriptWriter(this.code);
    let lambdaConstructName: string = `${apiName}Lambda`;
    let lambdaVariable: string = `${apiName}_lambdaFn`;
    let funcName: string = `${apiName}Lambda`;
    let handlerName: string = "main.handler";
    let handlerAsset: string = "lambda-fns";
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

    if (lambdaStyle === LAMBDASTYLE.multi) {
      lambdaConstructName = `${apiName}Lambda${functionName}`;
      lambdaVariable = `${apiName}_lambdaFn_${functionName}`;
      funcName = `${apiName}Lambda${functionName}`;
      handlerName = `${functionName}.handler`;
      handlerAsset = `lambda-fns/${functionName}`;
    }

    if (lambdaStyle === LAMBDASTYLE.multi) {
      lambdaVariable = `${apiName}_lambdaFn_${functionName}`;
      funcName = `${apiName}Lambda${functionName}`;
      handlerName = `${functionName}.handler`;
    }

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
        layers:[${apiName}_lambdaLayer],
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

  public lambdaLayer(apiName: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_lambdaLayer`,
        typeName: "lambda.LayerVersion",
        initializer: () => {
          this.code.line(`new lambda.LayerVersion(this, "${apiName}LambdaLayer", {
          code: lambda.Code.fromAsset('lambdaLayer'),
        })`);
        },
      },
      "const"
    );
  }

  public addEnvironment(
    lambda: string,
    envName: string,
    value: string,
    lambdaStyle: string,
    functionName?: string
  ) {
    if (lambdaStyle === LAMBDASTYLE.single) {
      this.code.line(`${lambda}_lambdaFn.addEnvironment("${envName}", ${value});`);
    } else if (lambdaStyle === LAMBDASTYLE.multi) {
      this.code.line(
        `${lambda}_lambdaFn_${functionName}.addEnvironment("${envName}", ${value});`
      );
    }
  }

  public initializeTestForLambdaWithDynamoDB(
    funcName: string,
    handlerName: string
  ) {
    this.code.line(`expect(actual).to(
      haveResource("AWS::Lambda::Function", {
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
    );`);
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
            stack.getLogicalId(VpcNeptuneConstruct_stack.SGRef.node.defaultChild as cdk.CfnElement),
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
