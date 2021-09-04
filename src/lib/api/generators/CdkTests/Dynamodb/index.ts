import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import { CONSTRUCTS, Config } from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { Iam } from "../../../constructs/Iam";
import { DynamoDB } from "../../../constructs/Dynamodb";

type StackBuilderProps = {
  config: Config;
};

export class dynamoDBConstructTest {
  outputFile: string = `${CONSTRUCTS.lambda}.test.ts`;
  outputDir: string = `test`;
  config: Config;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async constructdynamoDBConstructTestFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName } = this.config.api;
    const cdk = new Cdk();
    const dynamodb = new DynamoDB();
    const imp = new Imports();

    imp.ImportsForTest(this.outputDir, "pattern_v1");
    this.code.line;

    cdk.initializeTest(
      "Dynamodb Constructs Test",
      () => {
        this.code.line();
        dynamodb.initializeTestForDynamodb(apiName);
      },
      this.outputDir,
      "patter_v1"
    );
  }
}
