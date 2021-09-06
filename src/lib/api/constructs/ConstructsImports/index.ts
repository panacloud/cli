import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS } from "../../../../utils/constants";
const _ = require("lodash")

export class Imports {
  code: CodeMaker;
  constructor(_code: CodeMaker){
    this.code = _code
  }
  public importsForStack(){
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["Stack", "StackProps"]);
    ts.writeImports("constructs", ["Construct"]);
  }

  public importAppsync() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_appsync as appsync"]);
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

  public importLambda() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["aws_lambda as lambda"]);
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

  
  public importIndividualLambdaFunction(
    name: string,
    path: string
  ) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${path}`, [name]);
  }

  public importAxios() {
    this.code.line(`var axios = require('axios')`);
  }

  public importCdkDuration(){
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports("aws-cdk-lib", ["Duration"]);
  }

  public importForDynamodbConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.dynamodb}`, [CONSTRUCTS.dynamodb]);
  }

  public importForLambdaConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.lambda}`, [CONSTRUCTS.lambda]);
  }

  public importForNeptuneConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.neptuneDb}`, [CONSTRUCTS.neptuneDb]);
  }

  public importForAuroraDbConstruct() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`./${CONSTRUCTS.auroradb}`, [CONSTRUCTS.auroradb]);
  }

  public importForAppsyncConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.appsync}`, [CONSTRUCTS.appsync]);
  }

  public importForDynamodbConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.dynamodb}`, [CONSTRUCTS.dynamodb]);
  }

  public importForLambdaConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.lambda}`, [CONSTRUCTS.lambda]);
  }

  public importForNeptuneConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.neptuneDb}`, [CONSTRUCTS.neptuneDb]);
  }

  public importForAuroraDbConstructInTest() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeImports(`../lib/${CONSTRUCTS.auroradb}`, [CONSTRUCTS.auroradb]);
  }

  public ImportsForTest(
    workingDir: string,
    pattern: string
  ) {
    const ts = new TypeScriptWriter(this.code);
    if (pattern === "pattern_v1") {
      ts.writeImports("aws-cdk-lib", ["cdk"]);
      ts.writeImports("@aws-cdk/assert", [
        "countResources",
        "haveResource",
        "expect",
        "countResourcesLike",
      ]);
      ts.writeImports(`../lib/${workingDir}-stack`, _.upperFirst(_.camelCase(workingDir)))
    } else if (pattern === "pattern_v2") {
      ts.writeImports("aws-cdk-lib", ["cdk"]);
      this.code.line(`import "@aws-cdk/assert/jest"`);
    }
  }
}