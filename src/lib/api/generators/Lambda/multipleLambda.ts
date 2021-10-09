import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE } from "../../../../utils/constants";
import { Imports } from "../../constructs/ConstructsImports";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";

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
      api: { apiType },
    } = this.config;
    const imp = new Imports(this.code);
    const lambda = new LambdaFunction(this.code);

    if (apiType === APITYPE.graphql) {
      const {
        api: { queiresFields, mutationFields },
      } = this.config;
      let mutationsAndQueries: string[] = [
        ...queiresFields!,
        ...mutationFields!,
      ];

      for (let i = 0; i < mutationsAndQueries.length; i++) {
        const key = mutationsAndQueries[i];
        this.outputFile = "index.ts";
        this.code.openFile(this.outputFile);

          this.code.line(`var testCollections = require("/opt/testCollections")`);
          this.code.line();
          imp.importAxios();
          this.code.line();
        

        lambda.initializeLambdaFunction(apiType);

        this.code.closeFile(this.outputFile);
        this.outputDir = `lambda/${key}`;
        await this.code.save(this.outputDir);
      }
    }
  }
}

export const multipleLambda = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new MultipleLambda(props);
  await builder.MultipleLambdaFile();
};
