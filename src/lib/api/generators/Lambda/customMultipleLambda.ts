import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { ApiModel, APITYPE } from "../../../../utils/constants";
import { Imports } from "../../constructs/ConstructsImports";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
const _ = require("lodash");
const SwaggerParser = require("@apidevtools/swagger-parser");

type StackBuilderProps = {
  config: ApiModel;
};

class CustomMultipleLambda {
  outputFile: string = `main.ts`;
  outputDir: string = `lambda`;
  customOutputFile: string = `main.ts`;
  customOutputDir: string = `lambda`;
  config: ApiModel;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async MultipleLambdaFile() {
    const {
      api: { lambdaStyle, apiType, mockApi },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      const {
        api: { queiresFields, mutationFields },
      } = this.config;
      let mutationsAndQueries: string[] = [
        ...queiresFields!,
        ...mutationFields!,
      ];

      mutationsAndQueries.forEach(async (key: string) => {
       
                // custom code
                const lambda = new LambdaFunction(this.code);

                this.customOutputFile = "handler.ts";
                this.code.openFile(this.customOutputFile);
                        
                lambda.helloWorldFunction(key);
        

                
                this.code.closeFile(this.customOutputFile);
                this.customOutputDir = `custom_src/lambda/${key}`;
                await this.code.save(this.customOutputDir);
        
                console.log('create 1 file')
        

      });

   
    }
  }
}

export const customMultipleLambda = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new CustomMultipleLambda(props);
  await builder.MultipleLambdaFile();
};
