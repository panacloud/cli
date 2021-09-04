import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import {
  CONSTRUCTS,
  Config,
  APITYPE,
  DATABASE,
  LAMBDASTYLE,
} from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { Neptune } from "../../../constructs/Neptune";
import { Iam } from "../../../constructs/Iam";
import { AuroraServerless } from "../../../constructs/AuroraServerless";
import { DynamoDB } from "../../../constructs/Dynamodb";
import { Lambda } from "../../../constructs/Lambda";
import {
  lambdaWithAuroraFunction,
  lambdaWithNeptuneFunction,
} from "./functions";

type StackBuilderProps = {
  config: Config;
};

export class LambdaConstructTest {
  outputFile: string = `${CONSTRUCTS.lambda}.test.ts`;
  outputDir: string = `test`;
  config: Config;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcLambdaConstructTestFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName, lambdaStyle, database, apiType } = this.config.api;
    const cdk = new Cdk();
    const neptune = new Neptune();
    const auroradb = new AuroraServerless();
    const dynamodb = new DynamoDB();
    const lambda = new Lambda();
    const imp = new Imports();
    const iam = new Iam();
    let mutations = {};
    let queries = {};

    //   if (apiType === APITYPE.graphql) {
    //     mutations = model.type.Mutation ? model.type.Mutation : {};
    //     queries = model.type.Query ? model.type.Query : {};
    //   }
    const mutationsAndQueries = { ...mutations, ...queries };

    if (database === DATABASE.dynamo) {
      imp.ImportsForTest(this.outputDir, "pattern1");
      imp.importForDynamodbConstructInTest();
      this.code.line();
      cdk.initializeTest(
        "Lambda Attach With Dynamodb Constructs Test",
        () => {
          this.code.line();
          if (database === DATABASE.dynamo) {
            if (
              apiType === APITYPE.rest ||
              (lambdaStyle === LAMBDASTYLE.single &&
                apiType === APITYPE.graphql)
            ) {
              let funcName = `${apiName}Lambda`;
              iam.dynamodbConsturctIdentifier();
              this.code.line();
              iam.DynodbTableIdentifier();
              this.code.line();
              lambda.initializeTestForLambdaWithDynamoDB(funcName, "main");
              this.code.line();
            } else if (lambdaStyle === LAMBDASTYLE.multi) {
              iam.dynamodbConsturctIdentifier();
              this.code.line();
              iam.DynodbTableIdentifier();
              this.code.line();
              Object.keys(mutationsAndQueries).forEach((key) => {
                let funcName = `${apiName}Lambda${key}`;
                lambda.initializeTestForLambdaWithDynamoDB(funcName, key);
                this.code.line();
              });
            }
          }
          iam.lambdaServiceRoleTest();
          this.code.line();
          if (apiType === APITYPE.graphql) {
            if (
              lambdaStyle === LAMBDASTYLE.single &&
              database === DATABASE.dynamo
            ) {
              iam.lambdaServiceRolePolicyTestForDynodb(1);
            } else if (
              lambdaStyle === LAMBDASTYLE.multi &&
              database === DATABASE.dynamo
            ) {
              iam.lambdaServiceRolePolicyTestForDynodb(
                Object.keys(mutationsAndQueries).length
              );
            }
          } else if (apiType === APITYPE.rest && database === DATABASE.dynamo) {
            iam.lambdaServiceRolePolicyTestForDynodb(1);
          }
          this.code.line();
        },
        this.outputDir,
        "pattern_v1"
      );
    } else if (database === DATABASE.neptune) {
      imp.ImportsForTest(this.outputDir, "pattern_v2");
      imp.importForNeptuneConstructInTest();
      imp.importForLambdaConstructInTest();
      this.code.line();
      cdk.initializeTest(
        "Lambda Attach With NeptuneDB Constructs Test",
        () => {
          this.code.line();
          iam.constructorIdentifier(CONSTRUCTS.neptuneDb);
          this.code.line();
          lambdaWithNeptuneFunction();
          this.code.line();
          if (
            apiType === APITYPE.rest ||
            (lambdaStyle === LAMBDASTYLE.single && apiType === APITYPE.graphql)
          ) {
            let funcName = `${apiName}Lambda`;
            lambda.initializeTestForLambdaWithNeptune(funcName, "main");
          } else if (lambdaStyle === LAMBDASTYLE.multi) {
            Object.keys(mutationsAndQueries).forEach((key) => {
              let funcName = `${apiName}Lambda${key}`;
              lambda.initializeTestForLambdaWithNeptune(funcName, key);
              this.code.line();
            });
          }
        },
        this.outputDir,
        "pattern_v2"
      );
    } else if (database === DATABASE.aurora) {
      imp.ImportsForTest(this.outputDir, "pattern_v2");
      imp.importForAuroraDbConstructInTest();
      imp.importForLambdaConstructInTest();
      this.code.line();
      cdk.initializeTest(
        "Lambda Attach With Aurora Constructs Test",
        () => {
          this.code.line();
          iam.constructorIdentifier(CONSTRUCTS.auroradb);
          this.code.line();
          lambdaWithAuroraFunction();
          this.code.line();
          iam.serverlessClusterIdentifier();
          this.code.line();
          iam.secretIdentifier();
          this.code.line();
          iam.secretAttachment();
          this.code.line();
          if (
            apiType === APITYPE.rest ||
            (lambdaStyle === LAMBDASTYLE.single && apiType === APITYPE.graphql)
          ) {
            let funcName = `${apiName}Lambda`;
            lambda.initializeTestForLambdaWithAuroradb(funcName, "main");
          } else if (lambdaStyle === LAMBDASTYLE.multi) {
            Object.keys(mutationsAndQueries).forEach((key) => {
              let funcName = `${apiName}Lambda${key}`;
              lambda.initializeTestForLambdaWithAuroradb(funcName, key);
              this.code.line();
            });
          }
        },
        this.outputDir,
        "pattern_v2"
      );
    }
  }
}
