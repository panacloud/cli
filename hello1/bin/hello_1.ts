import * as cdk from "aws-cdk-lib";
import { Hello1Stack } from "../lib/hello_1-stack";
const app: cdk.App = new cdk.App();
const stack = new Hello1Stack(app, "Hello1Stack", {});
