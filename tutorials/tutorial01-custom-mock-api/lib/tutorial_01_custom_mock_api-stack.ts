import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { VpcNeptuneConstruct } from "./VpcNeptuneConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

interface EnvProps {
  prod?: string;
}

export class Tutorial01CustomMockApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: EnvProps) {
    super(scope, id);

    const myApi_neptunedb: VpcNeptuneConstruct = new VpcNeptuneConstruct(
      this,
      "myApiVpcNeptuneConstruct",
      {
        prod: props?.prod,
      }
    );
    const myApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("editable_src/lambdaLayer"),
      }
    );
    const myApi_mock_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myApiMockLambdaLayer",
      {
        code: lambda.Code.fromAsset("editable_src/customMockLambdaLayer"),
      }
    );
    const myApi_lambdaFn_user: lambda.Function = new lambda.Function(
      this,
      "myApiLambdauser",
      {
        functionName: props?.prod
          ? props?.prod + "-myApiLambdauser"
          : "myApiLambdauser",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/user"),
        layers: [myApi_mock_lambdaLayer],

        vpc: myApi_neptunedb.VPCRef,
        securityGroups: [myApi_neptunedb.SGRef],
        environment: {
          NEPTUNE_ENDPOINT: myApi_neptunedb.neptuneReaderEndpoint,
        },
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }
    );
    const myApi_lambdaFn_addUser: lambda.Function = new lambda.Function(
      this,
      "myApiLambdaaddUser",
      {
        functionName: props?.prod
          ? props?.prod + "-myApiLambdaaddUser"
          : "myApiLambdaaddUser",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/addUser"),
        layers: [myApi_mock_lambdaLayer],

        vpc: myApi_neptunedb.VPCRef,
        securityGroups: [myApi_neptunedb.SGRef],
        environment: {
          NEPTUNE_ENDPOINT: myApi_neptunedb.neptuneReaderEndpoint,
        },
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }
    );
    const myApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "myApiAppsyncConstruct",
      {
        myApi_lambdaFn_userArn: myApi_lambdaFn_user.functionArn,
        myApi_lambdaFn_addUserArn: myApi_lambdaFn_addUser.functionArn,
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}
