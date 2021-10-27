import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE, ARCHITECTURE } from "../../../../utils/constants";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
import { Imports } from "../../constructs/ConstructsImports";

type StackBuilderProps = {
  config: ApiModel;
};

class CustomLambda {
  outputFile: string = `index.ts`;
  config: ApiModel;
  outputDir: string = `lambda`;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
  }

  async LambdaFile() {
    const {
      api: {
        apiType,
        generalFields,
        microServiceFields,
        mutationFields,
        apiName,
        nestedResolver,
        asyncFields
      },
    } = this.config;

    if (apiType === APITYPE.graphql) {

      const microServices = Object.keys(microServiceFields!);

      for (let i = 0; i < microServices.length; i++) {
        for (let j = 0; j < microServiceFields![microServices[i]].length; j++) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const imp = new Imports(code);

          const key = microServiceFields![microServices[i]][j];
          code.openFile(this.outputFile);

          imp.importAxios();
          code.line();

          lambda.emptyLambdaFunction();

          code.closeFile(this.outputFile);
          this.outputDir = `editable_src/lambda/${microServices[i]}/${key}`;
          await code.save(this.outputDir);

          if (asyncFields && asyncFields.includes(key)) {
            const code = new CodeMaker();
            const lambda = new LambdaFunction(code);
            const imp = new Imports(code);

            this.outputFile = "index.ts";
            code.openFile(this.outputFile);

            code.line();

            lambda.emptyLambdaFunction();

            code.closeFile(this.outputFile);
            this.outputDir = `editable_src/lambda/${microServices[i]}/${key}_consumer`;
            await code.save(this.outputDir);
          }
        }
      }

      for (let i = 0; i < generalFields!.length; i++) {
        const code = new CodeMaker();
        const lambda = new LambdaFunction(code);
        const imp = new Imports(code);

        const key = generalFields![i];
        this.outputFile = "index.ts";

        code.openFile(this.outputFile);

        imp.importAxios();
        code.line();

        lambda.emptyLambdaFunction();

        code.closeFile(this.outputFile);
        this.outputDir = `editable_src/lambda/${key}`;
        await code.save(this.outputDir);

        if (asyncFields && asyncFields.includes(key)) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);

          this.outputFile = "index.ts";
          code.openFile(this.outputFile);

          code.line();

          lambda.emptyLambdaFunction();

          code.closeFile(this.outputFile);
          this.outputDir = `editable_src/lambda/${key}_consumer`;
          await code.save(this.outputDir);
        }
      }

      if(nestedResolver){
        const {api:{nestedResolverFieldsAndLambdas}} = this.config
        const {nestedResolverLambdas} = nestedResolverFieldsAndLambdas!
        for (let index = 0; index < nestedResolverLambdas.length; index++) {
          const key = nestedResolverLambdas[index];
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          this.outputFile = "index.ts";
          code.openFile(this.outputFile);
          code.line();
          lambda.helloWorldFunction(apiName);
          code.closeFile(this.outputFile);
          this.outputDir = `editable_src/lambda/nestedResolvers/${key}`;
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
