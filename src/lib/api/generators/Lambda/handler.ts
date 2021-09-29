import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { ApiModel, APITYPE, LAMBDASTYLE } from "../../../../utils/constants";
import { Imports } from "../../constructs/ConstructsImports";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
const _ = require("lodash");
const SwaggerParser = require("@apidevtools/swagger-parser");

type StackBuilderProps = {
  config: ApiModel;
};

class Handlers {
  outputFile: string = `index.ts`;
  outputDir: string = `lambda`;
  config: ApiModel;
  jsonSchema: any;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async handlers() {
    const {api: { lambdaStyle, apiType,schema }} = this.config;
    if (apiType === APITYPE.graphql) {
      const {api: { queiresFields,mutationFields }} = this.config;
      let mutationsAndQueries:string[] = [...queiresFields!,...mutationFields!]      
      if (lambdaStyle === LAMBDASTYLE.single) {
        this.outputFile = "main.ts";
        this.code.openFile(this.outputFile);
        const lambda = new LambdaFunction(this.code);
        const imp = new Imports(this.code);
        mutationsAndQueries.forEach((key:string)=> imp.importIndividualLambdaFunction(key, `${key}`))

        imp.importAxios();
        this.code.line();
        this.code.indent(`
          type Event = {
              info: {
                fieldName: string
              }
          }`);
        this.code.line();
        lambda.initializeLambdaFunction(lambdaStyle, apiType, () => {
          mutationsAndQueries.forEach((key:string)=>{
            this.code.indent(`
              case "${key}":
                  return await ${key}();
              `);
          })

        });
        this.code.closeFile(this.outputFile);
        await this.code.save(this.outputDir);
      } else if (lambdaStyle === LAMBDASTYLE.multi) {
        mutationsAndQueries.forEach(async(key:string)=>{
            this.outputFile = "index.ts";
            this.code.openFile(this.outputFile);
            const imp = new Imports(this.code);
            const lambda = new LambdaFunction(this.code);
            imp.importAxios();
            lambda.initializeLambdaFunction(lambdaStyle, apiType);
            this.code.closeFile(this.outputFile);
            this.outputDir = `lambda/${key}`;
            await this.code.save(this.outputDir);
        })

        }

    }
     else {
      SwaggerParser.validate(
        this.config.api.schemaPath,
        async (err: any, api: any) => {
          if (err) {
            console.error(err);
          } else {
            this.outputFile = "main.ts";
            this.code.openFile(this.outputFile);
            const ts = new TypeScriptWriter(this.code);
            const lambda = new LambdaFunction(this.code);
            const imp = new Imports(this.code);
            imp.importAxios();
            /* import all lambda files */
            Object.keys(api.paths).forEach((path) => {
              for (var methodName in api.paths[`${path}`]) {
                let lambdaFunctionFile =
                  api.paths[`${path}`][`${methodName}`][`operationId`];
                imp.importIndividualLambdaFunction(
                  lambdaFunctionFile,
                  `${lambdaFunctionFile}`
                );
              }
            });
            this.code.line();

            let isFirstIf: boolean = true;
            lambda.initializeLambdaFunction(lambdaStyle, apiType, () => {
              Object.keys(api.paths).forEach((path) => {
                for (var methodName in api.paths[`${path}`]) {
                  let lambdaFunctionFile =
                    api.paths[`${path}`][`${methodName}`][`operationId`];
                  isFirstIf
                    ? this.code.indent(`
                      if (method === "${_.upperCase(
                        methodName
                      )}" && requestName === "${path.substring(1)}") {
                        return await ${lambdaFunctionFile}();
                      }
                    `)
                    : this.code.indent(`
                      else if (method === "${_.upperCase(
                        methodName
                      )}" && requestName === "${path.substring(1)}") {
                        return await ${lambdaFunctionFile}();
                      }
                    `);
                  isFirstIf = false;
                }
              });
            });
            this.code.closeFile(this.outputFile);
            await this.code.save(this.outputDir);
          }
        }
      );
    }
  }
}
export const handlers = async (props: StackBuilderProps): Promise<void> => {
  const builder = new Handlers(props);
  await builder.handlers();
};
