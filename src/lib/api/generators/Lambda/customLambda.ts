import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE } from "../../../../utils/constants";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";

type StackBuilderProps = {
  config: ApiModel;
};

class CustomLambda {
  outputFile: string = `index.ts`;
  outputDir: string = `lambda`;
  config: ApiModel;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async LambdaFile() {
    const {
      api: { apiType, lambdaStyle, mockApi },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      const {
        api: { queiresFields, mutationFields },
      } = this.config;
      let mutationsAndQueries: string[] = [
        ...queiresFields!,
        ...mutationFields!,
      ];
      const lambda = new LambdaFunction(this.code);

      mutationsAndQueries.forEach(async (key: string) => {
        this.code.openFile(this.outputFile);

        lambda.initializeLambdaFunction(lambdaStyle, apiType);

        this.code.closeFile(this.outputFile);
        this.outputDir = `custom_src/lambda/${key}`;
        await this.code.save(this.outputDir);
      });
    }
  }
}

export const customLambda = async (props: StackBuilderProps): Promise<void> => {
  const builder = new CustomLambda(props);
  await builder.LambdaFile();
};
