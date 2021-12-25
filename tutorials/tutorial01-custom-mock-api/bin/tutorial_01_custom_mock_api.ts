import * as cdk from "aws-cdk-lib";
import { Tutorial01CustomMockApiStack } from "../lib/tutorial_01_custom_mock_api-stack";
const app: cdk.App = new cdk.App();
const deployEnv = process.env.STAGE;
const stack = new Tutorial01CustomMockApiStack(
  app,
  deployEnv
    ? deployEnv + "-Tutorial01CustomMockApiStack"
    : "Tutorial01CustomMockApiStack",
  { prod: deployEnv }
);
