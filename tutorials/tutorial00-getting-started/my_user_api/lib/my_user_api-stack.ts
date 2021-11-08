import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { VpcNeptuneConstruct } from "./VpcNeptuneConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export class MyUserApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const myUserApi_neptunedb: VpcNeptuneConstruct = new VpcNeptuneConstruct(
      this,
      "myUserApiVpcNeptuneConstruct"
    );
    const myUserApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myUserApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("lambdaLayer"),
      }
    );
    const myUserApi_lambdaFn_user: lambda.Function = new lambda.Function(
      this,
      "myUserApiLambdauser",
      {
        functionName: "myUserApiLambdauser",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/user"),
        layers: [myUserApi_lambdaLayer],

        vpc: myUserApi_neptunedb.VPCRef,
        securityGroups: [myUserApi_neptunedb.SGRef],
        environment: {
          NEPTUNE_ENDPOINT: myUserApi_neptunedb.neptuneReaderEndpoint,
        },
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }
    );
    const myUserApi_lambdaFn_addUser: lambda.Function = new lambda.Function(
      this,
      "myUserApiLambdaaddUser",
      {
        functionName: "myUserApiLambdaaddUser",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/addUser"),
        layers: [myUserApi_lambdaLayer],

        vpc: myUserApi_neptunedb.VPCRef,
        securityGroups: [myUserApi_neptunedb.SGRef],
        environment: {
          NEPTUNE_ENDPOINT: myUserApi_neptunedb.neptuneReaderEndpoint,
        },
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }
    );
    const myUserApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "myUserApiAppsyncConstruct",
      {
        myUserApi_lambdaFn_userArn: myUserApi_lambdaFn_user.functionArn,
        myUserApi_lambdaFn_addUserArn: myUserApi_lambdaFn_addUser.functionArn,
      }
    );
    new AspectController(this);
  }
}
