import { CodeMaker } from "codemaker";
import { APITYPE, Config, LAMBDASTYLE } from "../../../../utils/constants";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
const SwaggerParser = require("@apidevtools/swagger-parser");

type StackBuilderProps = {
  config: Config;
};

class LambdaHandlers {
  outputFile: string = `index.ts`;
  outputDir: string = `lambda`;
  config: Config;
  jsonSchema: any;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async lambdaHandler() {
    const {
      api: { lambdaStyle, apiType },
    } = this.config;
    const { type } = this.config;

    if (apiType === APITYPE.graphql) {
      if (lambdaStyle === LAMBDASTYLE.single) {
        if (type?.Query) {
          Object.keys(type.Query).forEach(async (key) => {
            this.outputFile = `${key}.ts`;
            this.code.openFile(this.outputFile);
            const lambda = new LambdaFunction(this.code);
            lambda.helloWorldFunction(key);
            this.code.closeFile(this.outputFile);
            await this.code.save(this.outputDir);
          });
        }
        if (type?.Mutation) {
          Object.keys(type.Mutation).forEach(async (key) => {
            this.outputFile = `${key}.ts`;
            this.code.openFile(this.outputFile);
            const lambda = new LambdaFunction(this.code);
            lambda.helloWorldFunction(key);
            this.code.closeFile(this.outputFile);
            await this.code.save(this.outputDir);
          });
        }
      }
    } else {
      SwaggerParser.validate("./nexmo.json", (err: any, api: any) => {
        if (err) {
          console.log(err);
        } else {
          Object.keys(api.paths).forEach(async (path) => {
            for (var methodName in api.paths[`${path}`]) {
              let lambdaFunctionFile =
                api.paths[`${path}`][`${methodName}`][`operationId`];
              this.outputFile = `${lambdaFunctionFile}.ts`;
              this.code.openFile(this.outputFile);
              const lambda = new LambdaFunction(this.code);
              lambda.helloWorldFunction(lambdaFunctionFile);
              this.code.closeFile(this.outputFile);
              await this.code.save(this.outputDir);
            }
          });
        }
      });
    }
  }
}

export const lambdaHandlers = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new LambdaHandlers(props);
  await builder.lambdaHandler();
};
