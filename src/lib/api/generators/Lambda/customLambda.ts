import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE } from "../../../../utils/constants";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
import { Imports } from "../../constructs/ConstructsImports";

type StackBuilderProps = {
  config: ApiModel;
};

class CustomLambda {
  outputFile: string = `index.ts`;
  config: ApiModel;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async LambdaFile() {
    const {
      api: { apiType },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      const {
        api: { microServiceFields,generalFields },
      } = this.config;


      const lambda = new LambdaFunction(this.code);
      const imp = new Imports(this.code);

      const microServices = Object.keys(microServiceFields);

      for (let i = 0; i < microServices.length; i++) {
      for (let j = 0; j < microServiceFields[microServices[i]].length; j++) {
   
        const key = microServiceFields[microServices[i]][j];

        this.code.openFile(this.outputFile);

        imp.importAxios();
        this.code.line();

        lambda.emptyLambdaFunction();

        this.code.closeFile(this.outputFile);
        const outputDir = `custom_src/lambda/${microServices[i]}/${key}`;
        await this.code.save(outputDir);
      }

    }


    for (let i = 0; i < generalFields.length; i++) {

      const key = generalFields[i];
      this.outputFile = "index.ts";
      this.code.openFile(this.outputFile);

      imp.importAxios();
      this.code.line();

      lambda.emptyLambdaFunction();

      this.code.closeFile(this.outputFile);
      const outputDir = `custom_src/lambda/${key}`;
      await this.code.save(outputDir);
    }



    }
  }
}

export const customLambda = async (props: StackBuilderProps): Promise<void> => {
  const builder = new CustomLambda(props);
  await builder.LambdaFile();
};
