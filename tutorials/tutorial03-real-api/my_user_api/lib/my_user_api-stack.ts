import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { VpcNeptuneConstruct } from "./VpcNeptuneConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda, Duration } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

interface EnvProps {
  prod?: string;
}

export class MyUserApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: EnvProps) {
    super(scope, id);

    const myUserApi_neptunedb: VpcNeptuneConstruct = new VpcNeptuneConstruct(
      this,
      "myUserApiVpcNeptuneConstruct",
      {
        prod: props?.prod,
      }
    );
    const myUserApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myUserApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("editable_src/lambdaLayer"),
      }
    );
    const myUserApi_mock_lambdaLayer: lambda.LayerVersion =
      new lambda.LayerVersion(this, "myUserApiMockLambdaLayer", {
        code: lambda.Code.fromAsset("mock_lambda_layer"),
      });
    const myUserApi_lambdaFn_user: lambda.Function = new lambda.Function(
      this,
      "myUserApiLambdauser",
      {
        functionName: props?.prod
          ? props?.prod + "-myUserApiLambdauser"
          : "myUserApiLambdauser",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("editable_src/lambda_stubs/user"),
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
        functionName: props?.prod
          ? props?.prod + "-myUserApiLambdaaddUser"
          : "myUserApiLambdaaddUser",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("editable_src/lambda_stubs/addUser"),
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
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}
