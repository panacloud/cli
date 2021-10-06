import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE, ARCHITECTURE } from "../../../../utils/constants";
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
      api: { lambdaStyle, apiType, mockApi, architecture },
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
          this.code.line(`var data = require("/opt/testCollections")`);
          this.code.line();
        } else {
          imp.importAxios();
          this.code.line();
        }

        lambda.initializeLambdaFunction(lambdaStyle, apiType, mockApi, key);

        this.code.closeFile(this.outputFile);
        this.outputDir = `lambda/${key}`;
        await this.code.save(this.outputDir);
      });

      if (architecture === ARCHITECTURE.eventDriven) {
        this.outputFile = "index.ts";
        this.code.openFile(this.outputFile);

        const imp = new Imports(this.code);
        const lambda = new LambdaFunction(this.code);

        imp.importAxios();
        this.code.line();

        lambda.initializeLambdaFunction(
          lambdaStyle,
          apiType,
          mockApi,
          "eventProducer"
        );

        this.code.closeFile(this.outputFile);
        this.outputDir = `lambda/eventProducer`;
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
