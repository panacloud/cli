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
  constructor(props: StackBuilderProps) {
    this.config = props.config;
  }

  async MultipleLambdaFile() {
    const {
      api: { apiType,generalFields,microServiceFields },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      

      const microServices = Object.keys(microServiceFields);

      for (let i = 0; i < microServices.length; i++) {
      for (let j = 0; j < microServiceFields[microServices[i]].length; j++) {
        const code = new CodeMaker();
        const lambda = new LambdaFunction(code);
        const imp = new Imports(code);
        const key = microServiceFields[microServices[i]][j];
        this.outputFile = `index.ts`;
        code.openFile(this.outputFile);

          code.line(`var testCollections = require("/opt/mockApi/testCollections")`);
          code.line();
          // imp.importAxios();
          // this.code.line();

        lambda.initializeLambdaFunction(apiType, undefined , key);

        code.closeFile(this.outputFile);
        this.outputDir = `lambda/${microServices[i]}/${key}`;
        await code.save(this.outputDir);
      }

    }





    for (let i = 0; i < generalFields.length; i++) {
      const code = new CodeMaker();
      const lambda = new LambdaFunction(code);
      const imp = new Imports(code);
      const key = generalFields[i];
      this.outputFile = "index.ts";
      code.openFile(this.outputFile);

        code.line(`var testCollections = require("/opt/mockApi/testCollections")`);
        code.line();
        // imp.importAxios();
        // this.code.line();

      lambda.initializeLambdaFunction(apiType, undefined , key);

      code.closeFile(this.outputFile);
      this.outputDir = `lambda/${key}`;
      await code.save(this.outputDir);
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
