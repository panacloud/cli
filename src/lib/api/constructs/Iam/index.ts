import { CodeMaker } from "codemaker";
import { CONSTRUCTS, DATABASE, LAMBDASTYLE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class Iam {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public serviceRoleForLambda(apiName: string, managedPolicies?: string[]) {
    const ts = new TypeScriptWriter(this.code);
    const policies = managedPolicies
      ? `managedPolicies: [
          ${managedPolicies.map(
            (v) => `iam.ManagedPolicy.fromAwsManagedPolicyName("${v}")`
          )}
        ],`
      : " ";

    ts.writeVariableDeclaration(
      {
        name: `${apiName}Lambda_serviceRole`,
        typeName: "iam.Role",
        initializer: () => {
          this.code.line(`new iam.Role(this,'lambdaServiceRole',{
                    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
                   ${policies}
              });`);
        },
      },
      "const"
    );
  }

  public serviceRoleForAppsync(apiName: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_serviceRole`,
        typeName: "iam.Role",
        initializer: () => {
          this.code.line(`new iam.Role(this,'appsyncServiceRole',{
                    assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
                   });`);
        },
      },
      "const"
    );
  }

  public attachLambdaPolicyToRole(roleName: string) {
    this.code
      .line(`${roleName}_serviceRole.addToPolicy(new iam.PolicyStatement({
                resources: ['*'],
                actions: ['lambda:InvokeFunction'],
              }));`);
  }

  public appsyncServiceRoleTest() {
    this.code.line(`expect(stack).toHaveResource("AWS::IAM::Role", {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
              Service: "appsync.amazonaws.com",
            },
          },
        ],
        Version: "2012-10-17",
      },
    })
`);
  }

  public appsyncRolePolicyTest() {
    this.code.line(`expect(stack).toHaveResource("AWS::IAM::Policy", {
            PolicyDocument: {
              Statement: [
                {
                  Action: "lambda:InvokeFunction",
                  Effect: "Allow",
                  Resource: "*",
                },
              ],
              Version: "2012-10-17",
            },
            Roles: [
              {
                Ref: stack.getLogicalId(role[0].node.defaultChild as cdk.CfnElement),
              },
            ],
          })`);
    this.code.line();
  }

  public lambdaServiceRoleTest() {
    this.code.line(`expect(stack).toHaveResource("AWS::IAM::Role", {
            AssumeRolePolicyDocument: {
              Statement: [
                {
                  Action: "sts:AssumeRole",
                  Effect: "Allow",
                  Principal: {
                    Service: "lambda.amazonaws.com",
                  },
                },
              ],
              Version: "2012-10-17",
            },
          });`);
  }

  public lambdaServiceRolePolicyTestForDynodb(policyCount: number) {
    this.code.line(`expect(actual).to(
            countResourcesLike("AWS::IAM::Policy",${policyCount}, {
              PolicyDocument: {
                Statement: [
                  {
                    Action: "dynamodb:*",
                    Effect: "Allow",
                    Resource: [
                      {
                        "Fn::GetAtt": [
                          stack.getLogicalId(
                            db_table[0].node.defaultChild as cdk.CfnElement
                          ),
                          "Arn",
                        ],
                      },
                      {
                        Ref: "AWS::NoValue",
                      },
                    ],
                  },
                ],
                Version: "2012-10-17",
              }
            })
          );`);
  }

  public roleIdentifierFromStack() {
    this.code.line(`const role = stack.node.children.filter((elem) => {
          return elem instanceof cdk.aws_iam.Role;
        });`);
  }

  public lambdaIdentifierFromStack() {
    this.code.line(`const lambda_func = stack.node.children.filter((elem) => {
          return elem instanceof cdk.aws_lambda.Function;
        });`);
  }

  public roleIdentifierFromLambda() {
    this.code
      .line(`const lambda_role = lambda_func[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_iam.Role;
        });`);
  }

  public dynamodbConsturctIdentifier() {
    this.code.line(`const dbConstruct = stack.node.children.filter(elem => {
            return elem instanceof ${CONSTRUCTS.dynamoDB};
          });`);
  }

  public DynamoDBConsturctIdentifier() {
    this.code.line(
      `const ${CONSTRUCTS.dynamoDB}_stack = new ${CONSTRUCTS.dynamoDB}(stack,"${CONSTRUCTS.dynamoDB}Test");`
    );
  }

  public lambdaConsturctIdentifier() {
    this.code.line(`const Lambda_consturct = stack.node.children.filter(
          (elem) => elem instanceof ${CONSTRUCTS.lambda}
        );`);
  }

  public lambdaConsturctTestIdentifier() {
    this.code
      .line(`const Lambda_consturct = ${CONSTRUCTS.lambda}_stack.node.children.filter(
          (elem) => elem instanceof ${CONSTRUCTS.lambda}
        );`);
  }

  public lambdaIdentifier() {
    this.code
      .line(`const lambda_func = Lambda_consturct[0].node.children.filter(
          (elem) => elem instanceof cdk.aws_lambda.Function
        );`);
  }

  public appsyncConsturctIdentifier() {
    this.code.line(`const Appsync_consturct = stack.node.children.filter(
          (elem) => elem instanceof ${CONSTRUCTS.appsync}
        );`);
  }

  public appsyncApiIdentifier() {
    this.code
      .line(`const appsync_api = Appsync_consturct[0].node.children.filter(
          (elem) => elem instanceof cdk.aws_appsync.CfnGraphQLApi
        );`);
  }

  public appsyncApiTestIdentifier() {
    this.code
      .line(`const appsync_api = ${CONSTRUCTS.appsync}_stack.node.children.filter(
          (elem) => elem instanceof cdk.aws_appsync.CfnGraphQLApi
        );`);
  }

  public appsyncRoleIdentifier() {
    this.code
      .line(`const role = Appsync_consturct[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_iam.Role;
        });`);
  }

  public appsyncRoleTestIdentifier() {
    this.code
      .line(`const role = ${CONSTRUCTS.appsync}_stack.node.children.filter((elem) => {
          return elem instanceof cdk.aws_iam.Role;
        });`);
  }

  public DynodbTableIdentifier() {
    this.code
      .line(`const db_table = dbConstruct[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_dynamodb.Table;
        });`);
  }

  public DynodbTableTestIdentifier() {
    this.code
      .line(`const db_table = ${CONSTRUCTS.dynamoDB}_stack.node.children.filter((elem) => {
          return elem instanceof cdk.aws_dynamodb.Table;
        });`);
  }

  public natgatewayIdentifier(natGatewayNum: string, subnetNum: number) {
    this.code
      .line(`const natGateway${natGatewayNum} = public_subnets[${subnetNum}].node.children.filter((elem) => {
          return elem instanceof cdk.aws_ec2.CfnNatGateway;
        });`);
  }

  public eipIdentifier(epiNum: string, subnetNum: number) {
    this.code
      .line(`const eip${epiNum} = public_subnets[${subnetNum}].node.children.filter((elem) => {
          return elem instanceof cdk.aws_ec2.CfnEIP;
        });`);
  }

  public internetGatewayIdentifier() {
    this.code
      .line(`const internetGateway = ${CONSTRUCTS.auroraDB}_stack.vpcRef.node.children.filter((elem) => {
          return elem instanceof cdk.aws_ec2.CfnInternetGateway;
        });`);
  }

  public serverlessClusterIdentifier() {
    this.code
      .line(`const ServerlessCluster = ${CONSTRUCTS.auroraDB}_stack.node.children.filter((elem) => {
          return elem instanceof cdk.aws_rds.ServerlessCluster;
        }); `);
  }

  public secretIdentifier() {
    this.code
      .line(`const secret = ServerlessCluster[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_secretsmanager.Secret;
        });`);
  }

  public secretAttachment() {
    this.code
      .line(`const secretAttachment = secret[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_secretsmanager.SecretTargetAttachment;
        });`);
  }

  public constructorIdentifier(constructor: string) {
    this.code.line(
      `const ${constructor}_stack = new ${constructor}(stack, "${constructor}Test");`
    );
  }

  public LambdaConstructIdentifierForDbb() {
    this.code
      .line(` const ${CONSTRUCTS.lambda}_stack = new ${CONSTRUCTS.lambda}(stack, "${CONSTRUCTS.lambda}Test", { tableName: ${CONSTRUCTS.dynamoDB}_stack.table.tableName})
    `);
  }

  public appsyncDatabasePropsHandler(
    apiName: string,
    lambdaStyle: string,
    database: string,
    mutationsAndQueries: any,
    code: CodeMaker
  ) {
    let lambdafunc = `${apiName}_lambdaFn`;
    this.code.line(
      `const ${CONSTRUCTS.appsync}_stack = new ${CONSTRUCTS.appsync}(stack, "${CONSTRUCTS.appsync}Test", {`
    );
    if (lambdaStyle === LAMBDASTYLE.single && database === DATABASE.dynamoDB) {
      code.line(
        `${lambdafunc}Arn : ${CONSTRUCTS.lambda}_stack.${lambdafunc}.functionArn`
      );
    }
    else if (lambdaStyle === LAMBDASTYLE.multi && database === DATABASE.dynamoDB) {
      Object.keys(mutationsAndQueries).forEach((key) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        code.line(
          `${lambdafunc}Arn : ${CONSTRUCTS.lambda}_stack.${lambdafunc}.functionArn,`
        );
      });
    }
    if (
      lambdaStyle === LAMBDASTYLE.single &&
      (database === DATABASE.neptuneDB || database === DATABASE.auroraDB)
    ) {
      lambdafunc = `${apiName}_lambdaFnArn`;
      code.line(`${lambdafunc} : ${CONSTRUCTS.lambda}_stack.${lambdafunc}`);
    }
    else if (
      lambdaStyle === LAMBDASTYLE.multi &&
      (database === DATABASE.neptuneDB || database === DATABASE.auroraDB)
    ) {
      Object.keys(mutationsAndQueries).forEach((key) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        code.line(`${lambdafunc}Arn : ${CONSTRUCTS.lambda}_stack.${lambdafunc}Arn,`);
      });
    }
    this.code.line(`})`);
  }

  public LambdaConstructIdentifierForNeptunedb() {
    this.code.line(`const ${CONSTRUCTS.lambda}_stack = new ${CONSTRUCTS.lambda}(
      stack,
      "${CONSTRUCTS.lambda}Test",
      {
        VPCRef: ${CONSTRUCTS.neptuneDB}_stack.VPCRef,
        SGRef: ${CONSTRUCTS.neptuneDB}_stack.SGRef,
        neptuneReaderEndpoint: ${CONSTRUCTS.neptuneDB}_stack.neptuneReaderEndpoint,
      }
    );
    `);
  }

  public LambdaConstructIdentifierForAuroradb() {
    this.code
      .line(`const ${CONSTRUCTS.lambda}_stack = new ${CONSTRUCTS.lambda}(stack, '${CONSTRUCTS.lambda}Test', {
    vpcRef: ${CONSTRUCTS.auroraDB}_stack.vpcRef,
    secretRef: ${CONSTRUCTS.auroraDB}_stack.secretRef,
    serviceRole: ${CONSTRUCTS.auroraDB}_stack.serviceRole,
    });
  `);
  }
}
