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
  constructor(props: StackBuilderProps) {
    this.config = props.config;
  }

  async MultipleLambdaFile() {
    const {
      api: { apiType,generalFields,microServiceFields,mutationFields,architecture,apiName },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      
      const code = new CodeMaker();
      const lambda = new LambdaFunction(code);
      const imp = new Imports(code);

      const microServices = Object.keys(microServiceFields);

      for (let i = 0; i < microServices.length; i++) {
      for (let j = 0; j < microServiceFields[microServices[i]].length; j++) {
  
        const key = microServiceFields[microServices[i]][j];
        const isMutation = mutationFields?.includes(key);
        this.outputFile = `index.ts`;
        code.openFile(this.outputFile);

        code.line(`var testCollections = require("/opt/mockApi/testCollections")`);
        code.line();
        // imp.importAxios();
        // this.code.line();
        lambda.initializeLambdaFunction(apiType, apiName, undefined, key, isMutation ? architecture : undefined,);

        code.closeFile(this.outputFile);
        this.outputDir = `mock_lambda/${microServices[i]}/${key}`;
        await code.save(this.outputDir);



        if (architecture === ARCHITECTURE.eventDriven) {
          if (isMutation) {
            
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

    }





    for (let i = 0; i < generalFields.length; i++) {

      const key = generalFields[i];
      this.outputFile = "index.ts";
      const isMutation = mutationFields?.includes(key);

      code.openFile(this.outputFile);

        code.line(`var testCollections = require("/opt/mockApi/testCollections")`);
        code.line();
        // imp.importAxios();
        // this.code.line();

        lambda.initializeLambdaFunction(apiType, apiName, undefined, key, isMutation ? architecture : undefined,);

      code.closeFile(this.outputFile);
      this.outputDir = `mock_lambda/${key}`;
      await code.save(this.outputDir);


      
      if (architecture === ARCHITECTURE.eventDriven) {
        if (isMutation) {
          
          this.outputFile = "index.ts";
          code.openFile(this.outputFile);
      
          code.line();
      
          lambda.helloWorldFunction(apiType);
      
          code.closeFile(this.outputFile);
          this.outputDir = `mock_lambda/${key}_consumer`;
          await code.save(this.outputDir);
        }
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
