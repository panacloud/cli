import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE, ARCHITECTURE } from "../../../../utils/constants";
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
    const { api: { apiType, architecture, apiName,nestedResolver,schemaTypes }} = this.config;

    if (apiType === APITYPE.graphql) {
      const {  api: { queiresFields, mutationFields }} = this.config;
      
      let mutationsAndQueries: string[] = [
        ...queiresFields!,
        ...mutationFields!,
      ];

      for (let i = 0; i < mutationsAndQueries.length; i++) {
        const code = new CodeMaker();
        const lambda = new LambdaFunction(code);
        const imp = new Imports(code);
        const ts = new TypeScriptWriter(code);
        const key = mutationsAndQueries[i];
        const isMutation = mutationFields?.includes(key);
        this.outputFile = "index.ts";
        code.openFile(this.outputFile);

        ts.writeImports("../../lambdaLayer/mockApi/testCollectionsTypes", [
          "TestCollection",
        ]);
        code.line(`var data = require("/opt/mockApi/testCollections") as {
          testCollections: TestCollection;
        };`);
        code.line();
        // imp.importAxios();
        // this.code.line();
        lambda.initializeLambdaFunction(apiType, apiName, undefined, key, isMutation ? architecture : undefined);
        code.closeFile(this.outputFile);
        this.outputDir = `mock_lambda/${key}`;
        await code.save(this.outputDir);
      }

      if (nestedResolver) {
        for (let i = 0; i < schemaTypes!.length; i++) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const key = schemaTypes![i];
          this.outputFile = "index.ts";
          code.openFile(this.outputFile);
          code.line(`var testCollections = require("/opt/mockApi/testCollections")`);
          code.line();         
          lambda.initializeLambdaFunction(apiType, apiName, undefined, key, undefined,nestedResolver);
          code.closeFile(this.outputFile);
          this.outputDir = `mock_lambda/${key}`;
          await code.save(this.outputDir);
        }

      }
        

      if (architecture === ARCHITECTURE.eventDriven) {
        for (let i = 0; i < (mutationFields || []).length; i++) {
          if (!mutationFields) { continue }
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const key = `${mutationFields[i]}_consumer`;
          this.outputFile = "index.ts";
          code.openFile(this.outputFile);
          code.line();
          lambda.helloWorldFunction(apiType);
          code.closeFile(this.outputFile);
          this.outputDir = `consumer_lambda/${key}`;
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
