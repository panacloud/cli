import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE, ARCHITECTURE } from "../../../../utils/constants";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
import { Imports } from "../../constructs/ConstructsImports";

type StackBuilderProps = {
  config: ApiModel;
};

class CustomLambda {
  outputFile: string = `index.ts`;
  outputDir: string = `lambda`;
  config: ApiModel;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
  }

  async LambdaFile() {
    const {
      api: { apiType, architecture },
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
        const code = new CodeMaker();
        const lambda = new LambdaFunction(code);
        const imp = new Imports(code);
        code.openFile(this.outputFile);

        imp.importAxios();
        code.line();

        lambda.emptyLambdaFunction();

        code.closeFile(this.outputFile);
        this.outputDir = `editable_src/lambda/${key}`;
        await code.save(this.outputDir);
      });

      if (architecture === ARCHITECTURE.eventDriven) {
        for (let i = 0; i < (mutationFields || []).length; i++) {
          if (!mutationFields) { continue }
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const imp = new Imports(code);
          const key = `${mutationFields[i]}_consumer`;
          this.outputFile = "index.ts";
          code.openFile(this.outputFile);

          code.line();

          lambda.helloWorldFunction(apiType);

          code.closeFile(this.outputFile);
          this.outputDir = `editable_src/lambda/${key}`;
          await code.save(this.outputDir);
        }
      }

    }
  }
}

export const customLambda = async (props: StackBuilderProps): Promise<void> => {
  const builder = new CustomLambda(props);
  await builder.LambdaFile();
};
