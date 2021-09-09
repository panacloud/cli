import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import { CONSTRUCTS, Config } from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { DynamoDB } from "../../../constructs/Dynamodb";
import { Iam } from "../../../constructs/Iam";

type StackBuilderProps = {
  config: Config;
};

export class DynamoDBConstructTest {
  outputFile: string = `${CONSTRUCTS.dynamodb}.test.ts`;
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
    const cdk = new Cdk(this.code);
    const dynamodb = new DynamoDB(this.code);
    const imp = new Imports(this.code);
    const iam = new Iam(this.code)

    imp.ImportsForTest();
    imp.importForDynamodbConstructInTest()
    this.code.line();
    cdk.initializeTest(
      "Dynamodb Constructs Test",
      () => {
        iam.constructorIdentifier(CONSTRUCTS.dynamodb)
        this.code.line()
        dynamodb.initializeTestForDynamodb(apiName);
      },
    );

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const dynamodbConstructTest = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new DynamoDBConstructTest(props);
  await builder.constructdynamoDBConstructTestFile();
};
