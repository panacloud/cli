import * as cdk from "aws-cdk-lib";
import { Tutorial00GettingStartedGraphqlStack } from "../lib/tutorial_00_getting_started_graphql-stack";
const app: cdk.App = new cdk.App();
const deployEnv = process.env.STAGE;
const stack = new Tutorial00GettingStartedGraphqlStack(
  app,
  deployEnv
    ? deployEnv + "-Tutorial00GettingStartedGraphqlStack"
    : "Tutorial00GettingStartedGraphqlStack",
  { prod: deployEnv }
);
