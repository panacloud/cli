import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE, ARCHITECTURE, CONSTRUCTS } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
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
      api: {  apiType,  generalFields,  microServiceFields,  mutationFields,  architecture,  apiName,  nestedResolver}} = this.config;

    if (apiType === APITYPE.graphql) {
      const microServices = Object.keys(microServiceFields!);

      for (let i = 0; i < microServices.length; i++) {
        for (let j = 0; j < microServiceFields![microServices[i]].length; j++) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const imp = new Imports(code);
          const ts = new TypeScriptWriter(code);

          const key = microServiceFields![microServices[i]][j];
          const isMutation = mutationFields?.includes(key);
          this.outputFile = `index.ts`;
          code.openFile(this.outputFile);

          ts.writeImports("../../../lambdaLayer/mockApi/testCollectionsTypes", [
            "TestCollection",
          ]);
          code.line(`var data = require("/opt/mockApi/testCollections") as {
          testCollections: TestCollection;
        };`);
          code.line();

          lambda.initializeLambdaFunction(
            apiType,
            apiName,
            undefined,
            key,
            isMutation ? architecture : undefined
          );

          code.closeFile(this.outputFile);
          this.outputDir = `mock_lambda/${microServices[i]}/${key}`;
          await code.save(this.outputDir);

          if (architecture === ARCHITECTURE.eventDriven && isMutation) {
            const code = new CodeMaker();
            const lambda = new LambdaFunction(code);
            const imp = new Imports(code);

            this.outputFile = "index.ts";
            code.openFile(this.outputFile);

            code.line();

            lambda.helloWorldFunction(apiType);

            code.closeFile(this.outputFile);
            this.outputDir = `mock_lambda/${microServices[i]}/${key}_consumer`;
            await code.save(this.outputDir);
          }
        }
      }

      for (let i = 0; i < generalFields!.length; i++) {
        const code = new CodeMaker();
        const lambda = new LambdaFunction(code);
        const imp = new Imports(code);
        const ts = new TypeScriptWriter(code);
        const key = generalFields![i];
        this.outputFile = "index.ts";
        const isMutation = mutationFields?.includes(key);
        code.openFile(this.outputFile);

        ts.writeImports("../../lambdaLayer/mockApi/testCollectionsTypes", [
          "TestCollection",
        ]);
        code.line(`var data = require("/opt/mockApi/testCollections") as {
        testCollections: TestCollection;
      };`);
        code.line();

        lambda.initializeLambdaFunction(
          apiType,
          apiName,
          undefined,
          key,
          isMutation ? architecture : undefined
        );

        code.closeFile(this.outputFile);
        this.outputDir = `mock_lambda/${key}`;
        await code.save(this.outputDir);

        if (architecture === ARCHITECTURE.eventDriven && isMutation) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          this.outputFile = "index.ts";
          code.openFile(this.outputFile);
          code.line();
          lambda.helloWorldFunction(apiName);
          code.closeFile(this.outputFile);
          this.outputDir = `mock_lambda/${key}_consumer`;
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
          this.outputDir = `mock_lambda/nestedResolvers/${key}`;
          await code.save(this.outputDir);
        }
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
