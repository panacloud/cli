import { CodeMaker } from "codemaker";
import { Property } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, ApiModel } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { DynamoDB } from "../../constructs/Dynamodb";

type StackBuilderProps = {
  config: ApiModel;
};

interface ConstructPropsType {
  name: string;
  type: string;
}

export class DyanmoDBConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.dynamoDB}`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcDynamoDBConstructFile() {
    this.code.openFile(this.outputFile);
    const { apiName } = this.config.api;
    const cdk = new Cdk(this.code);
    const imp = new Imports(this.code);
    const dynamoDB = new DynamoDB(this.code);
    // imports for dynamodb constructs
    imp.importDynamodb();

    const properties: Property[] = [
      // properties declaration for dynamoDb constructs
      {
        name: "table",
        typeName: "dynamodb.Table",
        accessModifier: "public",
        isReadonly: false,
      },
    ];

    let ConstructProps: ConstructPropsType[] = [];

    ConstructProps.push({
      name: `prod?`,
      type: "string",
    })

    cdk.initializeConstruct(
      CONSTRUCTS.dynamoDB,
      "DynamoDBProps",
      () => {
        dynamoDB.initializeDynamodb(apiName); // construct initializer for dynamoDb constructs
        this.code.line();
        this.code.line(`this.table = ${apiName}_table`); // properties initializer for dynamoDb constructs
        this.code.line();
      },
      ConstructProps,
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
