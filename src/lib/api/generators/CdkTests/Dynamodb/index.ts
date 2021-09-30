import { CodeMaker } from "codemaker";
import { CONSTRUCTS, ApiModel } from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { DynamoDB } from "../../../constructs/Dynamodb";
import { Iam } from "../../../constructs/Iam";

type StackBuilderProps = {
  config: ApiModel;
};

export class DynamoDBConstructTest {
  outputFile: string = `${CONSTRUCTS.dynamoDB}.test.ts`;
  outputDir: string = `test`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async constructdynamoDBConstructTestFile() {
    this.code.openFile(this.outputFile);

    const { apiName } = this.config.api;
    const cdk = new Cdk(this.code);
    const dynamodb = new DynamoDB(this.code);
    const imp = new Imports(this.code);
    const iam = new Iam(this.code);

    imp.ImportsForTest();
    imp.importForDynamodbConstructInTest();
    this.code.line();
    cdk.initializeTest("Dynamodb Constructs Test", () => {
      iam.constructorIdentifier(CONSTRUCTS.dynamoDB);
      this.code.line();
      dynamodb.initializeTestForDynamodb(apiName);
    });

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
