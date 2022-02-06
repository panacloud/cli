import * as cdk from "aws-cdk-lib";
import { MyUserApiStack } from "../lib/my_user_api-stack";
const app: cdk.App = new cdk.App();
const deployEnv = process.env.STAGE;
const stack = new MyUserApiStack(
  app,
  deployEnv ? deployEnv + "-MyUserApiStack" : "MyUserApiStack",
  { prod: deployEnv }
);
