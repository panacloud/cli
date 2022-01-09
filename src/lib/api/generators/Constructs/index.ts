import { CodeMaker } from "codemaker";
import { Property } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, ApiModel } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { DynamoDB } from "../../constructs/Dynamodb";

type StackBuilderProps = {
  config: ApiModel;
};

// interface ConstructPropsType {
//     name: string;
//     type: string;
//   }
  interface CustomConstructPropsType {
    name: string;
    type: string;

  }

export class Constructs {
  outputFile: string = `AddConstructs.ts`;
  outputDir: string = `editable_src/CustomConstructs`;
  code: CodeMaker;

  constructor() {
    this.code = new CodeMaker();
  }

  async ConstructFile() {
    this.code.openFile(this.outputFile);
    const cdk = new Cdk(this.code);
    const imp = new Imports(this.code);
    // imports for dynamodb constructs
    
    let ConstructProps: CustomConstructPropsType[] = [];

    ConstructProps.push({
      name: `prod?`,
      type:"string"
    })

    cdk.initializeConstruct(
      "AddConstruct",
      "ConstructProps",
      () => {
        
       
        this.code.line(`// write your custom Constructor here ...`); // properties initializer for dynamoDb constructs
        
      },
      ConstructProps);

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const AddConstruct = async (): Promise<void> => {
  const builder = new Constructs();
  await builder.ConstructFile();
};
