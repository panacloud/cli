import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppsyncConstruct } from "./AppsyncConstruct";
import { DynamoDBConstruct } from "./DynamoDBConstruct";
import { AspectController } from "../editable_src/aspects/AspectController";
import { aws_lambda as lambda } from "aws-cdk-lib";

export class Hello1Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    new AspectController(this);

    const myApi_table: DynamoDBConstruct = new DynamoDBConstruct(
      this,
      "myApiDynamoDBConstruct"
    );
    const myApi_lambdaLayer: lambda.LayerVersion = new lambda.LayerVersion(
      this,
      "myApiLambdaLayer",
      {
        code: lambda.Code.fromAsset("lambdaLayer"),
      }
    );
    const myApi_lambdaFn_getToDo: lambda.Function = new lambda.Function(
      this,
      "myApiLambdagetToDo",
      {
        functionName: "myApiLambdagetToDo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/getToDo"),
        layers: [myApi_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    const myApi_lambdaFn_getToDos: lambda.Function = new lambda.Function(
      this,
      "myApiLambdagetToDos",
      {
        functionName: "myApiLambdagetToDos",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/getToDos"),
        layers: [myApi_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    const myApi_lambdaFn_createToDo: lambda.Function = new lambda.Function(
      this,
      "myApiLambdacreateToDo",
      {
        functionName: "myApiLambdacreateToDo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/createToDo"),
        layers: [myApi_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    const myApi_lambdaFn_updateToDo: lambda.Function = new lambda.Function(
      this,
      "myApiLambdaupdateToDo",
      {
        functionName: "myApiLambdaupdateToDo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/updateToDo"),
        layers: [myApi_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    const myApi_lambdaFn_deleteToDo: lambda.Function = new lambda.Function(
      this,
      "myApiLambdadeleteToDo",
      {
        functionName: "myApiLambdadeleteToDo",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/deleteToDo"),
        layers: [myApi_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    const myApi_lambdaFn_deleteToDos: lambda.Function = new lambda.Function(
      this,
      "myApiLambdadeleteToDos",
      {
        functionName: "myApiLambdadeleteToDos",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("mock_lambda/deleteToDos"),
        layers: [myApi_lambdaLayer],

        environment: { TableName: myApi_table.table.tableName },
      }
    );
    myApi_table.table.grantFullAccess(myApi_lambdaFn_getToDo);
    myApi_table.table.grantFullAccess(myApi_lambdaFn_getToDos);
    myApi_table.table.grantFullAccess(myApi_lambdaFn_createToDo);
    myApi_table.table.grantFullAccess(myApi_lambdaFn_updateToDo);
    myApi_table.table.grantFullAccess(myApi_lambdaFn_deleteToDo);
    myApi_table.table.grantFullAccess(myApi_lambdaFn_deleteToDos);

    const myApi: AppsyncConstruct = new AppsyncConstruct(
      this,
      "myApiAppsyncConstruct",
      {
        myApi_lambdaFn_getToDoArn: myApi_lambdaFn_getToDo.functionArn,
        myApi_lambdaFn_getToDosArn: myApi_lambdaFn_getToDos.functionArn,
        myApi_lambdaFn_createToDoArn: myApi_lambdaFn_createToDo.functionArn,
        myApi_lambdaFn_updateToDoArn: myApi_lambdaFn_updateToDo.functionArn,
        myApi_lambdaFn_deleteToDoArn: myApi_lambdaFn_deleteToDo.functionArn,
        myApi_lambdaFn_deleteToDosArn: myApi_lambdaFn_deleteToDos.functionArn,
      }
    );
  }
}
