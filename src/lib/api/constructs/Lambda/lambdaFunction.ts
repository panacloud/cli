import { CodeMaker } from "codemaker";
import { LAMBDASTYLE, APITYPE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class LambdaFunction {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public initializeLambdaFunction(
    lambdaStyle: string,
    apiType: APITYPE,
    content?: any
  ) {
    const ts = new TypeScriptWriter(this.code);

    if (apiType === APITYPE.graphql) {
      if (lambdaStyle === LAMBDASTYLE.multi) {
        this.code.line(`
      var AWS = require('aws-sdk');
      
      exports.handler = async(event:any) => {
        // write your code here
        const data = await axios.post('http://sandbox:8080', event)
      }
      `);
      } else if (lambdaStyle === LAMBDASTYLE.single) {
        this.code.line(`exports.handler = async (event:Event) => {`);
        this.code.line(
          `const data = await axios.post('http://sandbox:8080', event)`
        );
        this.code.line();
        this.code.line(`switch (event.info.fieldName) {`);
        this.code.line();
        content();
        this.code.line();
        this.code.line(`}`);
        this.code.line(`}`);
      }
    } else {
      /* rest api */
      this.code.line(`exports.handler = async (event: any) => {`);
      this.code.line(
        `const data = await axios.post('http://sandbox:8080', event)`
      );
      this.code.line(`try {`);
      this.code.line();
      this.code.line("const method = event.httpMethod;");
      this.code.line(
        "const requestName = event.path.startsWith('/') ? event.path.substring(1) : event.path;"
      );
      this.code.line("const body = JSON.parse(event.body);");
      content();
      this.code.line();
      this.code.line(`}`);
      this.code.line("catch(err) {");
      this.code.line("return err;");
      this.code.line(`}`);
      this.code.line(`}`);
    }
  }

  public helloWorldFunction(name: string) {
    this.code.line(`
    const AWS = require('aws-sdk');
    
    export const ${name} = async() => {
      // write your code here
    }
    `);
  }
}
