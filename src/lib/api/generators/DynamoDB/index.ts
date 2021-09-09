import { CodeMaker } from "codemaker";
import { TypeScriptWriter, Property } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, Config } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { DynamoDB } from "../../constructs/Dynamodb";

type StackBuilderProps = {
  config: Config
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
    const cdk = new Cdk(this.code);
    const imp = new Imports(this.code);
    const dynamoDB = new DynamoDB(this.code);
    // imports for dynamodb constructs 
    imp.importsForStack();
    imp.importDynamodb();
    this.code.line();

    const properties: Property[] = [                                 // properties declaration for dynamoDb constructs
      {
        name: "table",
        typeName: "dynamodb.Table",
        accessModifier: "public",
        isReadonly: false
      },
    ];

    cdk.initializeConstruct(
      CONSTRUCTS.dynamodb,
      undefined,
      () => {
        dynamoDB.initializeDynamodb(apiName);                        // construct initializer for dynamoDb constructs
        this.code.line();
        this.code.line(`this.table = ${apiName}_table`);            // properties initializer for dynamoDb constructs
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
