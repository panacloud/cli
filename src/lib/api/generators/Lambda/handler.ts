import { CodeMaker } from "codemaker";
import { APITYPE, Config, LAMBDASTYLE } from "../../../../utils/constants";
import { Imports } from "../../constructs/ConstructsImports";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
const SwaggerParser = require("@apidevtools/swagger-parser");

type StackBuilderProps = {
  config: Config;
};

class Handlers {
  outputFile: string = `index.ts`;
  outputDir: string = `lambda`;
  config: Config;
  jsonSchema: any;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async handlers() {
    const { api: { lambdaStyle, apiType }} = this.config;
    const { type } = this.config;
    if (apiType === APITYPE.graphql) {
        if (lambdaStyle === LAMBDASTYLE.single) {
            this.outputFile="main.ts"
            this.code.openFile(this.outputFile)
            const lambda = new LambdaFunction(this.code);
            const imp = new Imports(this.code);        
          for (var key in type.Query) {
            imp.importIndividualLambdaFunction(key, `./${key}`);
          }
          for (var key in type.Mutation) {
            imp.importIndividualLambdaFunction( key, `./${key}`);
          }

          imp.importAxios();
          this.code.line();
          this.code.indent(`
          type Event = {
              info: {
                fieldName: string
              }
          }`);
          this.code.line();
          lambda.initializeLambdaFunction(lambdaStyle, apiType,() => {
            for (var key in type.Query) {
              this.code.indent(`
              case "${key}":
                  return await ${key}();
              `);
            }
            for (var key in type.Mutation) {
              this.code.indent(`
              case "${key}":
                  return await ${key}();
              `);
            }
          });
          this.code.closeFile(this.outputFile);
          await this.code.save(this.outputDir);
    }
     if (lambdaStyle === LAMBDASTYLE.multi){
      if (type.Mutation){
        Object.keys(type.Mutation).forEach(async(key) => {
            this.outputFile = key +".ts"
            this.code.openFile(this.outputFile)
              const imp = new Imports(this.code);
              const lambda = new LambdaFunction(this.code);
              imp.importAxios();
              lambda.initializeLambdaFunction(lambdaStyle,apiType);
              this.code.closeFile(this.outputFile);
              this.outputDir = `lambda/${key}`
              await this.code.save(this.outputDir);
            }
          );
      }
      if (type.Query) {
        Object.keys(type.Query).forEach(async(key) => {
            this.outputFile = key + ".ts"
            this.code.open(this.outputFile)
              const lambda = new LambdaFunction(this.code);
              const imp = new Imports(this.code);
              imp.importAxios();
              lambda.initializeLambdaFunction(lambdaStyle,apiType);
              this.code.closeFile(this.outputFile);
              this.outputDir = `lambda/${key}`
              await this.code.save(this.outputDir);
            }
        );
      }
    }
  } 
 }
}
export const handlers = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new Handlers(props);
  await builder.handlers();
};
