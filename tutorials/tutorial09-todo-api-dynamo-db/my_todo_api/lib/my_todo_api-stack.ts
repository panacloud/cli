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
        code: lambda.Code.fromAsset("editable_src/lambda_stubs/getToDos"),
        layers: [myTodoApi_lambdaLayer],

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
        code: lambda.Code.fromAsset("editable_src/lambda_stubs/createToDo"),
        layers: [myTodoApi_lambdaLayer],

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
        code: lambda.Code.fromAsset("editable_src/lambda_stubs/deleteToDo"),
        layers: [myTodoApi_lambdaLayer],

        environment: { TableName: myTodoApi_table.table.tableName },
      }
    );
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_getToDos);
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_createToDo);
    myTodoApi_table.table.grantFullAccess(myTodoApi_lambdaFn_deleteToDo);

    const myTodoApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "myTodoApiAppsyncConstruct",
      {
        myTodoApi_lambdaFn_getToDosArn: myTodoApi_lambdaFn_getToDos.functionArn,
        myTodoApi_lambdaFn_createToDoArn:
          myTodoApi_lambdaFn_createToDo.functionArn,
        myTodoApi_lambdaFn_deleteToDoArn:
          myTodoApi_lambdaFn_deleteToDo.functionArn,
        prod: props?.prod,
      }
    );
    new AspectController(this, props?.prod);
  }
}
