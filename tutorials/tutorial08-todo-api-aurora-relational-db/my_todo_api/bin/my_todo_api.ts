import * as cdk from "aws-cdk-lib";
import { MyTodoApiStack } from "../lib/my_todo_api-stack";
const app: cdk.App = new cdk.App();
const deployEnv = process.env.STAGE;
const stack = new MyTodoApiStack(
  app,
  deployEnv ? deployEnv + "-MyTodoApiStack" : "MyTodoApiStack",
  { prod: deployEnv }
);
