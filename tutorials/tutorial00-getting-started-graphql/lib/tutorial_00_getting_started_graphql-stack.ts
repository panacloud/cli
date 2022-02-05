import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { DynamoDBConstruct } from "./DynamoDBConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda, Duration } from "aws-cdk-lib";

interface EnvProps {
  prod?: string;
}

export class Tutorial00GettingStartedGraphqlStack extends Stack {
  constructor(scope: Construct, id: string, props?: EnvProps) {
    super(scope, id);

    const todoApi_table: DynamoDBConstruct = new DynamoDBConstruct(
      this,
      "todoApiDynamoDBConstruct",
      { prod: props?.prod }
    );
    const todoApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "todoApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("editable_src/lambdaLayer"),
      }
    );
    const todoApi_mock_lambdaLayer: lambda.LayerVersion =
      new lambda.LayerVersion(this, "todoApiMockLambdaLayer", {
        code: lambda.Code.fromAsset("mock_lambda_layer"),
      });
    const todoApi_lambdaFn_user: lambda.Function = new lambda.Function(
      this,
      "todoApiLambdauser",
      {
        functionName: props?.prod
          ? props?.prod + "-todoApiLambdauser"
          : "todoApiLambdauser",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/user"),
        layers: [todoApi_mock_lambdaLayer],

        environment: { TableName: todoApi_table.table.tableName },
      }
    );
    const todoApi_lambdaFn_addUser: lambda.Function = new lambda.Function(
      this,
      "todoApiLambdaaddUser",
      {
        functionName: props?.prod
          ? props?.prod + "-todoApiLambdaaddUser"
          : "todoApiLambdaaddUser",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/addUser"),
        layers: [todoApi_mock_lambdaLayer],

        environment: { TableName: todoApi_table.table.tableName },
      }
    );
    todoApi_table.table.grantFullAccess(todoApi_lambdaFn_user);
    todoApi_table.table.grantFullAccess(todoApi_lambdaFn_addUser);

    const todoApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "todoApiAppsyncConstruct",
      {
        todoApi_lambdaFn_userArn: todoApi_lambdaFn_user.functionArn,
        todoApi_lambdaFn_addUserArn: todoApi_lambdaFn_addUser.functionArn,
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}
