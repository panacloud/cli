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

    const myTodoApi_neptunedb: VpcNeptuneConstruct = new VpcNeptuneConstruct(
      this,
      "myTodoApiVpcNeptuneConstruct",
      {
        prod: props?.prod,
      }
    );
    const myTodoApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myTodoApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("editable_src/lambdaLayer"),
      }
    );
    const myTodoApi_mock_lambdaLayer: lambda.LayerVersion =
      new lambda.LayerVersion(this, "myTodoApiMockLambdaLayer", {
        code: lambda.Code.fromAsset("mock_lambda_layer"),
      });
    const myTodoApi_lambdaFn_getTodos: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdagetTodos",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdagetTodos"
          : "myTodoApiLambdagetTodos",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/todo/getTodos"),
        layers: [myTodoApi_mock_lambdaLayer],

        vpc: myTodoApi_neptunedb.VPCRef,
        securityGroups: [myTodoApi_neptunedb.SGRef],
        environment: {
          NEPTUNE_ENDPOINT: myTodoApi_neptunedb.neptuneReaderEndpoint,
        },
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }
    );
    const myTodoApi_lambdaFn_addTodo: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdaaddTodo",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdaaddTodo"
          : "myTodoApiLambdaaddTodo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/todo/addTodo"),
        layers: [myTodoApi_mock_lambdaLayer],

        vpc: myTodoApi_neptunedb.VPCRef,
        securityGroups: [myTodoApi_neptunedb.SGRef],
        environment: {
          NEPTUNE_ENDPOINT: myTodoApi_neptunedb.neptuneReaderEndpoint,
        },
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }
    );
    const myTodoApi_lambdaFn_updateTodo: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdaupdateTodo",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdaupdateTodo"
          : "myTodoApiLambdaupdateTodo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/todo/updateTodo"),
        layers: [myTodoApi_mock_lambdaLayer],

        vpc: myTodoApi_neptunedb.VPCRef,
        securityGroups: [myTodoApi_neptunedb.SGRef],
        environment: {
          NEPTUNE_ENDPOINT: myTodoApi_neptunedb.neptuneReaderEndpoint,
        },
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }
    );
    const myTodoApi_lambdaFn_deleteTodo: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdadeleteTodo",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdadeleteTodo"
          : "myTodoApiLambdadeleteTodo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/todo/deleteTodo"),
        layers: [myTodoApi_mock_lambdaLayer],

        vpc: myTodoApi_neptunedb.VPCRef,
        securityGroups: [myTodoApi_neptunedb.SGRef],
        environment: {
          NEPTUNE_ENDPOINT: myTodoApi_neptunedb.neptuneReaderEndpoint,
        },
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }
    );
    const myTodoApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "myTodoApiAppsyncConstruct",
      {
        myTodoApi_lambdaFn_getTodosArn: myTodoApi_lambdaFn_getTodos.functionArn,
        myTodoApi_lambdaFn_addTodoArn: myTodoApi_lambdaFn_addTodo.functionArn,
        myTodoApi_lambdaFn_updateTodoArn:
          myTodoApi_lambdaFn_updateTodo.functionArn,
        myTodoApi_lambdaFn_deleteTodoArn:
          myTodoApi_lambdaFn_deleteTodo.functionArn,
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}
