import { CodeMaker } from "codemaker";
import { Config, CONSTRUCTS } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { ApiGateway } from "../../constructs/ApiGateway";

type StackBuilderProps = {
    config: Config;
}

export class ApiGatewayConstruct {
    outputFile: string = `index.ts`;
    outputDir: string = `lib/${CONSTRUCTS.apigateway}`;
    config: Config;
    code: CodeMaker;

    constructor(props: StackBuilderProps) {
        this.config = props.config;
        this.code = new CodeMaker();
    }

    async constructApiGatewayConstructFile() {
        // const cdk = new Cdk();
        // const lambda = new Lambda();
        const ts = new TypeScriptWriter(this.code);
        this.code.openFile(this.outputFile);

        // const cdk = new Cdk(output);
        // const imp = new Imports(output);

        const apigw = new ApiGateway();
        
        // imp.importsForStack(output);
        // imp.importLambda(output);
        apigw.importApiGateway();
  
        const props = [
          {
            name: `${this.config.api.apiName}_lambdaFn`,
            type: "lambda.Function",
          },
        ];

        /* construct initializer code with intializeApiGateway in between */

        this.code.closeFile(this.outputFile);
        await this.code.save(this.outputDir);
    }
}