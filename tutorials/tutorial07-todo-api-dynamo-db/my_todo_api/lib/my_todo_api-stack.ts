import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { DynamoDBConstruct } from "./DynamoDBConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda, Duration } from "aws-cdk-lib";

interface EnvProps {
  prod?: string;
}

export class MyTodoApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: EnvProps) {
    super(scope, id);

    const myTodoApi_table: DynamoDBConstruct = new DynamoDBConstruct(
      this,
      "myTodoApiDynamoDBConstruct",
      { prod: props?.prod }
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
    const myTodoApi_lambdaFn_getToDo: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdagetToDo",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdagetToDo"
          : "myTodoApiLambdagetToDo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/getToDo"),
        layers: [myTodoApi_mock_lambdaLayer],

        environment: { TableName: myTodoApi_table.table.tableName },
      }
    );
    const myTodoApi_lambdaFn_getToDos: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdagetToDos",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdagetToDos"
          : "myTodoApiLambdagetToDos",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/getToDos"),
        layers: [myTodoApi_mock_lambdaLayer],

        environment: { TableName: myTodoApi_table.table.tableName },
      }
    );
    const myTodoApi_lambdaFn_createToDo: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdacreateToDo",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdacreateToDo"
          : "myTodoApiLambdacreateToDo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/createToDo"),
        layers: [myTodoApi_mock_lambdaLayer],

        environment: { TableName: myTodoApi_table.table.tableName },
      }
    );
    const myTodoApi_lambdaFn_updateToDo: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdaupdateToDo",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdaupdateToDo"
          : "myTodoApiLambdaupdateToDo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/updateToDo"),
        layers: [myTodoApi_mock_lambdaLayer],

        environment: { TableName: myTodoApi_table.table.tableName },
      }
    );
    const myTodoApi_lambdaFn_deleteToDo: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdadeleteToDo",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdadeleteToDo"
          : "myTodoApiLambdadeleteToDo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/deleteToDo"),
        layers: [myTodoApi_mock_lambdaLayer],

        environment: { TableName: myTodoApi_table.table.tableName },
      }
    );
    const myTodoApi_lambdaFn_deleteToDos: lambda.Function = new lambda.Function(
      this,
      "myTodoApiLambdadeleteToDos",
      {
        functionName: props?.prod
          ? props?.prod + "-myTodoApiLambdadeleteToDos"
          : "myTodoApiLambdadeleteToDos",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        memorySize: 128,
        timeout: Duration.seconds(6),
        code: lambda.Code.fromAsset("mock_lambda/deleteToDos"),
        layers: [myTodoApi_mock_lambdaLayer],

        environment: { TableName: myTodoApi_table.table.tableName },
      }
    );
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_getToDo);
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_getToDos);
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_createToDo);
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_updateToDo);
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_deleteToDo);
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_deleteToDos);

    const myTodoApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "myTodoApiAppsyncConstruct",
      {
        myTodoApi_lambdaFn_getToDoArn: myTodoApi_lambdaFn_getToDo.functionArn,
        myTodoApi_lambdaFn_getToDosArn: myTodoApi_lambdaFn_getToDos.functionArn,
        myTodoApi_lambdaFn_createToDoArn:
          myTodoApi_lambdaFn_createToDo.functionArn,
        myTodoApi_lambdaFn_updateToDoArn:
          myTodoApi_lambdaFn_updateToDo.functionArn,
        myTodoApi_lambdaFn_deleteToDoArn:
          myTodoApi_lambdaFn_deleteToDo.functionArn,
        myTodoApi_lambdaFn_deleteToDosArn:
          myTodoApi_lambdaFn_deleteToDos.functionArn,
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}
