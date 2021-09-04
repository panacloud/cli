import { CodeMaker } from "codemaker";
import { TypeScriptWriter, Property } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, Config } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { DynamoDB } from "../../constructs/DynamoDB";
import { dynamodbAccessHandler } from "./functions";

type StackBuilderProps = {
  config: Config;
};

export class DyanmoDBConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.dynamodb}`;
  config: Config;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcDynamoDBConstructFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);
    const { apiName } = this.config.api;
    const cdk = new Cdk();
    const imp = new Imports();
    const dynamoDB = new DynamoDB();

    imp.importsForStack();
    imp.importDynamodb();
    this.code.line();

    const properties: Property[] = [
      {
        name: "table",
        typeName: "dynamodb.Table",
        accessModifier: "public",
      },
    ];

    cdk.initializeConstruct(
      CONSTRUCTS.dynamodb,
      undefined,
      () => {
        dynamoDB.initializeDynamodb(apiName);
        this.code.line();
        this.code.line(`this.table = ${apiName}_table`);
        this.code.line();
      },
      undefined,
      properties
    );

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const dynamoDBConstruct = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new DyanmoDBConstruct(props);
  await builder.construcDynamoDBConstructFile();
};
