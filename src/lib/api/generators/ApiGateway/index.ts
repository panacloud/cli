import { CodeMaker } from "codemaker";
import { ApiModel, CONSTRUCTS } from "../../../../utils/constants";
import { ApiGateway } from "../../constructs/ApiGateway";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";

type StackBuilderProps = {
  config: ApiModel;
};

class ApiGatewayConstructFile {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.apigateway}`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async constructApiGatewayConstructFile() {
    this.code.openFile(this.outputFile);
    const apigw = new ApiGateway(this.code);
    const cdk = new Cdk(this.code);
    const imp = new Imports(this.code);

    imp.importsForStack();
    imp.importApiGateway();
    imp.importLambda();

    const props = [
      {
        name: `${this.config.api.apiName}_lambdaFn`,
        type: "lambda.Function",
      },
    ];

    /* construct initializer code with intializeApiGateway in between */
    cdk.initializeConstruct(
      `${CONSTRUCTS.apigateway}`,
      "ApiGatewayProps",
      () => {
        apigw.initializeApiGateway(this.config.api.apiName);
      },
      props
    );

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const ApiGatewayConstruct = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new ApiGatewayConstructFile(props);
  await builder.constructApiGatewayConstructFile();
};
