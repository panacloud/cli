import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE, ARCHITECTURE, Config } from "../../../../utils/constants";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
import { Imports } from "../../constructs/ConstructsImports";
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
import { mkdirRecursiveAsync } from "../../../fs";

type StackBuilderProps = {
  config: ApiModel;
  type: string
};

class CustomLambda {
  outputFile: string = `index.ts`;
  config: ApiModel;
  outputDir: string = `lambda`;
  type: string

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.type = props.type;
  }

  async LambdaFile() {
    const {
      api: {
        apiType,
        generalFields,
        microServiceFields,
        mutationFields,
        architecture,
        apiName,
        nestedResolver,
        nestedResolverFieldsAndLambdas
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
          const isMutation = mutationFields?.includes(key);
          code.openFile(this.outputFile);

          imp.importAxios();
          code.line();

          lambda.emptyLambdaFunction();

          code.closeFile(this.outputFile);
          this.outputDir = `editable_src/lambda/${microServices[i]}/${key}`;
          await code.save(this.outputDir);

          if (architecture === ARCHITECTURE.eventDriven && isMutation) {
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


      if(this.type === "update"){
        const files: string[] = []
        fs.readdirSync(`${process.cwd()}/editable_src/lambda`).forEach((file: string) => {
          if(file !== "nestedResolvers"){ 
            if(!microServices.includes(file)){
              console.log("file ", file);
            }
          }
          files.push(file);
        });

        const generalFieldsEvent = [...generalFields!, ]
        let differenceLambdas = generalFields!
          .filter(val => !files.includes(val))
          .concat(files.filter(val => generalFields!.includes(val)));

        console.log("differenceLambdas ", differenceLambdas)

        for (const ele of differenceLambdas) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const imp = new Imports(code);
  
          const key = ele
          this.outputFile = "index.ts";
          const isMutation = mutationFields?.includes(key);
  
          code.openFile(this.outputFile);
  
          imp.importAxios();
          code.line();
  
          lambda.emptyLambdaFunction();
  
          code.closeFile(this.outputFile);
          this.outputDir = `editable_src/lambda/${key}`;
          await code.save(this.outputDir);
  
          if (architecture === ARCHITECTURE.eventDriven && isMutation) {
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
        
      }
      else{
        for (const ele of generalFields!) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const imp = new Imports(code);
  
          const key = ele;
          this.outputFile = "index.ts";
          const isMutation = mutationFields?.includes(key);
  
          code.openFile(this.outputFile);
  
          imp.importAxios();
          code.line();
  
          lambda.emptyLambdaFunction();
  
          code.closeFile(this.outputFile);
          this.outputDir = `editable_src/lambda/${key}`;
          await code.save(this.outputDir);
  
          if (architecture === ARCHITECTURE.eventDriven && isMutation) {
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
      }
      

      if(nestedResolver){
        if(this.type === "update"){

          if (!fs.existsSync(`${process.cwd()}/editable_src/lambda/nestedResolvers`)){
            await mkdirRecursiveAsync(`editable_src/lambda/nestedResolvers`);
          }

          const files: string[] = []
          fs.readdirSync(`${process.cwd()}/editable_src/lambda/nestedResolvers`).forEach((file: string) => {
            files.push(file);
          });
          
          let differenceNestedLambdas = nestedResolverFieldsAndLambdas?.nestedResolverLambdas
            .filter(val => !files.includes(val))
            .concat(files.filter(val => !nestedResolverFieldsAndLambdas?.nestedResolverLambdas.includes(val)));

          for (const ele of differenceNestedLambdas!) {
            const code = new CodeMaker();
            const lambda = new LambdaFunction(code);
            this.outputFile = "index.ts";
            code.openFile(this.outputFile);
            code.line();
            lambda.helloWorldFunction(apiName);
            code.closeFile(this.outputFile);
            this.outputDir = `editable_src/lambda/nestedResolvers/${ele}`;
            await code.save(this.outputDir);
          }
        }
        else{
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
}

export const customLambda = async (props: StackBuilderProps): Promise<void> => {
  const builder = new CustomLambda(props);
  await builder.LambdaFile();
};
