import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS } from "../../../../utils/constants";
const _ = require("lodash");

export class Imports {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public importsForStack() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["Stack", "StackProps"]);
  }

  public importsForConstructs() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("constructs", ["Construct"]);
  }

  public importAppsync() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_appsync as appsync","CfnOutput"]);
  }

  public importCfnOutput() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["CfnOutput as CfnOutput"]);
  }

  public importForEventBrideConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.eventBridge}`, [CONSTRUCTS.eventBridge]);
  }

  public importApiGateway() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_apigateway as apigw"]);
  }

  public importDynamodb() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_dynamodb as dynamodb"]);
  }

  public importRds() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_rds as rds"]);
  }

  public importIam() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_iam as iam"]);
  }
  
  public importEventBridge() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_events as events"])
    ts.writeImports("aws-cdk-lib", ["aws_events_targets as targets"])
  } 

  public importLambda() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_lambda as lambda","Duration"]);
  }
  public importNeptune() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_neptune as neptune"]);
  }

  public importApiManager() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("panacloud-manager", ["PanacloudManager"]);
  }

  public importsForTags() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["Tags"]);
  }

  public importEc2() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_ec2 as ec2"]);
  }

  public importForAppsyncConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.appsync}`, [CONSTRUCTS.appsync]);
  }

  public importForApiGatewayConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.apigateway}`, [CONSTRUCTS.apigateway]);
  }

  public importIndividualLambdaFunction(name: string, path: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${path}`, [name]);
  }

  public importAxios() {
    this.code.line(`var axios = require('axios')`);
  }

  public importCdkDuration() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["Duration"]);
  }

  public importForDynamodbConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.dynamoDB}`, [CONSTRUCTS.dynamoDB]);
  }

  public importForLambdaConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.lambda}`, [CONSTRUCTS.lambda]);
  }

  public importForNeptuneConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.neptuneDB}`, [CONSTRUCTS.neptuneDB]);
  }

  public importForAuroraDbConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.auroraDB}`, [CONSTRUCTS.auroraDB]);
  }

  public importForRdsConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.rds}`, [CONSTRUCTS.rds]);
  }

  public importForAppsyncConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.appsync}`, [CONSTRUCTS.appsync]);
  }

  public importForDynamodbConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.dynamoDB}`, [CONSTRUCTS.dynamoDB]);
  }

  public importForLambdaConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.lambda}`, [CONSTRUCTS.lambda]);
  }

  public importForNeptuneConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.neptuneDB}`, [CONSTRUCTS.neptuneDB]);
  }

  public importForAuroraDbConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.auroraDB}`, [CONSTRUCTS.auroraDB]);
  }

  public ImportsForTest() {
    const ts = new TypeScriptWriter(this.code);
    this.code.line(`import * as cdk from "aws-cdk-lib"`);
    this.code.line(`import "@aws-cdk/assert/jest"`);
  }


  public importAspects() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["Aspects"]);
  }

  public importIaspect() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["IAspect"]);
  }

  public importStack() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["Stack"]);
  }

  public importIconstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("constructs/lib/construct", ["IConstruct"]);
  }

  public importAspectController() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("../editable_src/aspects/AspectController", ["AspectController"]);
  }

  public importDefaultVisitor() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("./DefaultVisitor", ["DefaultVisitor"]);
  }


}
