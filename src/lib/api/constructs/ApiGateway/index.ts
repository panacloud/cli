import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class ApiGateway {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }

  public initializeApiGateway(name: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${name}`,
        typeName: "apigw.LambdaRestApi",
        initializer: () => {
          this.code.line(`new apigw.LambdaRestApi(this,'${name}',{
                handler: props!.${name}_lambdaFn,
                defaultCorsPreflightOptions: {
                  allowOrigins: apigw.Cors.ALL_ORIGINS,
                  allowMethods: apigw.Cors.ALL_METHODS
                }
            })`);
        },
      },
      "const"
    );
  }
}
