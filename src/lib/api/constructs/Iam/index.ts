import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
let maker = new CodeMaker();

export class Iam extends CodeMaker {
  public serviceRoleForLambda(apiName: string, managedPolicies?: string[]) {
    const ts = new TypeScriptWriter(maker);
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
          this.line(`new iam.Role(this,'lambdaServiceRole',{
                    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
                   ${policies}
              });`);
        },
      },
      "const"
    );
  }

  public serviceRoleForAppsync(apiName: string) {
    const ts = new TypeScriptWriter(maker);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_serviceRole`,
        typeName: "iam.Role",
        initializer: () => {
          this.line(`new iam.Role(this,'appsyncServiceRole',{
                    assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
                   });`);
        },
      },
      "const"
    );
  }

  public attachLambdaPolicyToRole(roleName: string) {
    this.line(`${roleName}_serviceRole.addToPolicy(new iam.PolicyStatement({
                resources: ['*'],
                actions: ['lambda:InvokeFunction'],
              }));`);
  }

  public appsyncServiceRoleTest() {
    this.line(`expect(actual).to(
          haveResource("AWS::IAM::Role", {
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
        );`);
  }

  public appsyncRolePolicyTest() {
    this.line(`  expect(actual).to(
          haveResource("AWS::IAM::Policy", {
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
          })
        );`);
    this.line();
  }

  public lambdaServiceRoleTest() {
    this.line(`expect(actual).to(
          haveResource("AWS::IAM::Role", {
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
          })
        );`);
  }

  public lambdaServiceRolePolicyTestForDynodb(policyCount: number) {
    this.line(`expect(actual).to(
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
    this.line(`const role = stack.node.children.filter((elem) => {
          return elem instanceof cdk.aws_iam.Role;
        });`);
  }

  public lambdaIdentifierFromStack() {
    this.line(`const lambda_func = stack.node.children.filter((elem) => {
          return elem instanceof cdk.aws_lambda.Function;
        });`);
  }

  public roleIdentifierFromLambda() {
    this.line(`const lambda_role = lambda_func[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_iam.Role;
        });`);
  }

  public dynamodbConsturctIdentifier() {
    this.line(`const dbConstruct = stack.node.children.filter(elem => {
            return elem instanceof DynamodbConstruct;
          });`);
  }

  public lambdaConsturctIdentifier() {
    this.line(`const Lambda_consturct = stack.node.children.filter(
          (elem) => elem instanceof LambdaConstruct
        );`);
  }

  public lambdaIdentifier() {
    this.line(`const lambda_func = Lambda_consturct[0].node.children.filter(
          (elem) => elem instanceof cdk.aws_lambda.Function
        );`);
  }

  public appsyncConsturctIdentifier() {
    this.line(`const Appsync_consturct = stack.node.children.filter(
          (elem) => elem instanceof AppsyncConstruct
        );`);
  }

  public appsyncApiIdentifier() {
    this.line(`const appsync_api = Appsync_consturct[0].node.children.filter(
          (elem) => elem instanceof cdk.aws_appsync.CfnGraphQLApi
        );`);
  }

  public appsyncRoleIdentifier() {
    this.line(`const role = Appsync_consturct[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_iam.Role;
        });`);
  }

  public DynodbTableIdentifier() {
    this.line(`const db_table = dbConstruct[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_dynamodb.Table;
        });`);
  }

  public natgatewayIdentifier(natGatewayNum: string, subnetNum: number) {
    this.line(`const natGateway${natGatewayNum} = public_subnets[${subnetNum}].node.children.filter((elem) => {
          return elem instanceof cdk.aws_ec2.CfnNatGateway;
        });`);
  }

  public eipIdentifier(epiNum: string, subnetNum: number) {
    this.line(`const eip${epiNum} = public_subnets[${subnetNum}].node.children.filter((elem) => {
          return elem instanceof cdk.aws_ec2.CfnEIP;
        });`);
  }

  public internetGatewayIdentifier() {
    this.line(`const internetGateway = AuroraDbConstruct_stack.vpcRef.node.children.filter((elem) => {
          return elem instanceof cdk.aws_ec2.CfnInternetGateway;
        });`);
  }

  public serverlessClusterIdentifier() {
    this.line(`const ServerlessCluster = AuroraDbConstruct_stack.node.children.filter((elem) => {
          return elem instanceof cdk.aws_rds.ServerlessCluster;
        }); `);
  }

  public secretIdentifier() {
    this.line(`const secret = ServerlessCluster[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_secretsmanager.Secret;
        });`);
  }

  public secretAttachment() {
    this.line(`const secretAttachment = secret[0].node.children.filter((elem) => {
          return elem instanceof cdk.aws_secretsmanager.SecretTargetAttachment;
        });`);
  }

  public constructorIdentifier(constructor: string) {
    this.line(
      `const ${constructor}_stack = new ${constructor}(stack, "${constructor}Test");`
    );
  }
}
