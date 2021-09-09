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
import { Iam } from "../../../constructs/Iam";
import { Lambda } from "../../../constructs/Lambda";
import {
  lambdaWithAuroraFunction,
  lambdaWithNeptuneFunction,
} from "./functions";

type StackBuilderProps = {
  config: Config;
  schema: any;
};

export class LambdaConstructTest {
  outputFile: string = `${CONSTRUCTS.lambda}.test.ts`;
  outputDir: string = `test`;
  config: Config;
  jsonSchema: any;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
    this.jsonSchema = props.schema;
  }

  async construcLambdaConstructTestFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName, lambdaStyle, database, apiType } = this.config.api;
    const cdk = new Cdk(this.code);
    const lambda = new Lambda(this.code);
    const imp = new Imports(this.code);
    const iam = new Iam(this.code);
    let mutations = {};
    let queries = {};

    if (apiType === APITYPE.graphql) {
      mutations = this.jsonSchema.Mutation ? this.jsonSchema.Mutation : {};
      queries = this.jsonSchema.Query ? this.jsonSchema.Query : {};
    }
    const mutationsAndQueries = { ...mutations, ...queries };
    imp.ImportsForTest();

    if (database === DATABASE.dynamo) {
      imp.importForDynamodbConstructInTest();
      imp.importForLambdaConstructInTest()
    } else if (database === DATABASE.neptune) {
      imp.importForNeptuneConstructInTest();
      imp.importForLambdaConstructInTest();
    } else if (database === DATABASE.aurora) {
      imp.importForAuroraDbConstructInTest();
      imp.importForLambdaConstructInTest();
    }
    
      this.code.line();
      cdk.initializeTest(`Lambda Attach With ${database === DATABASE.dynamo ? "Dynamodb" : database === DATABASE.neptune ? "Neptunedb" : database === DATABASE.aurora ? "Aurorodb" : null} Constructs Test`, () => {
        this.code.line();
        if (database === DATABASE.dynamo) {
          iam.DynamoDBConsturctIdentifier()
          iam.LambdaConstructIdentifierForDbb();
          if (
            apiType === APITYPE.rest ||
            (lambdaStyle === LAMBDASTYLE.single && apiType === APITYPE.graphql)
          ) {
            let funcName = `${apiName}Lambda`;
            this.code.line();
            iam.DynodbTableTestIdentifier();
            this.code.line();
            lambda.initializeTestForLambdaWithDynamoDB(funcName, "main");
            this.code.line();
          } else if (lambdaStyle === LAMBDASTYLE.multi) {
            this.code.line();
            iam.DynodbTableTestIdentifier();
            this.code.line();
            Object.keys(mutationsAndQueries).forEach((key) => {
              let funcName = `${apiName}Lambda${key}`;
              lambda.initializeTestForLambdaWithDynamoDB(funcName, key);
              this.code.line();
            });
          }
        } else if (database === DATABASE.neptune) {
          this.code.line();
          iam.constructorIdentifier(CONSTRUCTS.neptuneDb);
          this.code.line();
          lambdaWithNeptuneFunction(this.code);
          this.code.line();
          if (
            apiType === APITYPE.rest ||
            (lambdaStyle === LAMBDASTYLE.single &&
              apiType === APITYPE.graphql)
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
            
          
        } else if (database === DATABASE.aurora) {
          this.code.line();
              this.code.line();
              iam.constructorIdentifier(CONSTRUCTS.auroradb);
              this.code.line();
              lambdaWithAuroraFunction(this.code);
              this.code.line();
              iam.serverlessClusterIdentifier();
              this.code.line();
              iam.secretIdentifier();
              this.code.line();
              iam.secretAttachment();
              this.code.line();
              if (
                apiType === APITYPE.rest ||
                (lambdaStyle === LAMBDASTYLE.single &&
                  apiType === APITYPE.graphql)
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
        }
        iam.lambdaServiceRoleTest();
        this.code.line();
      });

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const lambdaConstructTest = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new LambdaConstructTest(props);
  await builder.construcLambdaConstructTestFile();
};
