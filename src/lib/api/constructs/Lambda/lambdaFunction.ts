import { CodeMaker } from "codemaker";
import { LAMBDASTYLE, APITYPE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
let maker = new CodeMaker();

export class LambdaFunction extends CodeMaker {
  public initializeLambdaFunction(
    lambdaStyle: string,
    apiType: APITYPE,
    content?: any
  ) {
    const ts = new TypeScriptWriter(maker);

    if (apiType === APITYPE.graphql) {
      if (lambdaStyle === LAMBDASTYLE.multi) {
        this.line(`
      var AWS = require('aws-sdk');
      
      exports.handler = async(event:any) => {
        // write your code here
        const data = await axios.post('http://sandbox:8080', event)
      }
      `);
      } else if (lambdaStyle === LAMBDASTYLE.single) {
        this.line(`exports.handler = async (event:Event) => {`);
        this.line(
          `const data = await axios.post('http://sandbox:8080', event)`
        );
        this.line();
        this.line(`switch (event.info.fieldName) {`);
        this.line();
        content();
        this.line();
        this.line(`}`);
        this.line(`}`);
      }
    } else {
      /* rest api */
      this.line(`exports.handler = async (event: any) => {`);
      this.line(`const data = await axios.post('http://sandbox:8080', event)`);
      this.line(`try {`);
      this.line();
      this.line("const method = event.httpMethod;");
      this.line(
        "const requestName = event.path.startsWith('/') ? event.path.substring(1) : event.path;"
      );
      this.line("const body = JSON.parse(event.body);");
      content();
      this.line();
      this.line(`}`);
      this.line("catch(err) {");
      this.line("return err;");
      this.line(`}`);
      this.line(`}`);
    }
  }

  public helloWorldFunction(name: string) {
    this.line(`
    const AWS = require('aws-sdk');
    
    export const ${name} = async() => {
      // write your code here
    }
    `);
  }
}
