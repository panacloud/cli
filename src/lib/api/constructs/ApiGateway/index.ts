import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
let maker = new CodeMaker();

export class ApiGateway extends CodeMaker {
  public importApiGateway() {
    const ts = new TypeScriptWriter();
    ts.writeImports("aws-cdk-lib", ["aws_apigateway as apigw"], maker);
  }

  public initializeApiGateway(name: string) {
    const ts = new TypeScriptWriter();
    ts.writeVariableDeclaration(
      {
        name: `${name}`,
        typeName: "apigw.LambdaRestApi",
        initializer: () => {
          maker.line(`new apigw.LambdaRestApi(this,'${name}',{
                handler: props!.${name}_lambdaFn,
                defaultCorsPreflightOptions: {
                  allowOrigins: apigw.Cors.ALL_ORIGINS,
                  allowMethods: apigw.Cors.ALL_METHODS
                }
            })`);
        },
      },
      "const",
      maker
    );
  }
}