import * as cdk from "aws-cdk-lib";
import { MyUserApiStack } from "../lib/my_user_api-stack";
const app: cdk.App = new cdk.App();
const stack = new MyUserApiStack(app, "MyUserApiStack", {});
