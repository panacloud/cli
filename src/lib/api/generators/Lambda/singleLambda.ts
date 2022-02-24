import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE } from "../../../../utils/constants";
import { Imports } from "../../constructs/ConstructsImports";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
const upperCase = require("lodash/upperCase");
const SwaggerParser = require("@apidevtools/swagger-parser");

type StackBuilderProps = {
  config: ApiModel;
};

class SingleLambda {
  outputFile: string = `main.ts`;
  outputDir: string = `lambda`;
  config: ApiModel;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async SingleLambdaFile() {
    const {
      api: { apiType, apiName, database, neptuneQueryLanguage },
    } = this.config;

    if (apiType === APITYPE.rest) {
      SwaggerParser.validate(
        this.config.api.schemaPath,
        async (err: unknown, api: { paths: { [x: string]: { [x: string]: { [x: string]: string; }; }; }; }) => {
          if (err) {
            console.error(err);
          } else {
            this.code.openFile(this.outputFile);

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
            lambda.initializeLambdaFunction(apiType, apiName, () => {
              Object.keys(api.paths).forEach((path) => {
                for (var methodName in api.paths[`${path}`]) {
                  let lambdaFunctionFile =
                    api.paths[`${path}`][`${methodName}`][`operationId`];
                  isFirstIf
                    ? this.code.indent(`
                            if (method === "${upperCase(
                              methodName
                            )}" && requestName === "${path.substring(1)}") {
                              return await ${lambdaFunctionFile}();
                            }
                          `)
                    : this.code.indent(`
                            else if (method === "${upperCase(
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

            Object.keys(api.paths).forEach(async (path) => {
              for (var methodName in api.paths[`${path}`]) {
                let lambdaFunctionFile =
                  api.paths[`${path}`][`${methodName}`][`operationId`];

                this.outputFile = `${lambdaFunctionFile}.ts`;
                this.code.openFile(this.outputFile);

                const lambda = new LambdaFunction(this.code);
                lambda.helloWorldFunction(
                  lambdaFunctionFile,
                  database,
                  neptuneQueryLanguage!
                );

                this.code.closeFile(this.outputFile);
                await this.code.save(this.outputDir);
              }
            });
          }
        }
      );
    }
  }
}

export const singleLambda = async (props: StackBuilderProps): Promise<void> => {
  const builder = new SingleLambda(props);
  await builder.SingleLambdaFile();
};
