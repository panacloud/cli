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

class MultipleLambda {
  outputFile: string = `main.ts`;
  outputDir: string = `lambda`;
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
        this.outputFile = "index.ts";
        this.code.openFile(this.outputFile);
        
        const imp = new Imports(this.code);
        const lambda = new LambdaFunction(this.code);
        
        if (mockApi) {
          this.code.line(`const data = require("/opt/testCollections")`);
        } else {
          imp.importAxios();
          this.code.line();
        }
        
        lambda.initializeLambdaFunction(lambdaStyle, apiType, mockApi, key);
        
        this.code.closeFile(this.outputFile);
        this.outputDir = `lambda/${key}`;
        await this.code.save(this.outputDir);
      });
    }
  }
}

export const multipleLambda = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new MultipleLambda(props);
  await builder.MultipleLambdaFile();
};
