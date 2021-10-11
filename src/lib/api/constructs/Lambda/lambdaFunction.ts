import { CodeMaker } from "codemaker";
import { APITYPE } from "../../../../utils/constants";

export class LambdaFunction {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public initializeLambdaFunction(
    apiType: APITYPE,
    content?: any,
    fieldName?: string
  ) {
    if (apiType === APITYPE.graphql) {
      this.code.line(`var AWS = require('aws-sdk');`);
      this.code.line(`var isEqual = require('lodash.isequal');`);
      this.code.line();
      this.code.line(`exports.handler = async (event: any) => {`);
      content()
      // this.code.line(
      //   `const data = await axios.post('http://sandbox:8080', event)`
      // );
      this.code.line(`}`);
      // this.code.line();
      // this.code.line(`};`);
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

  public emptyLambdaFunction() {
    this.code.line(`var AWS = require('aws-sdk');`);
    this.code.line();
    this.code.line(`exports.handler = async (event: any) => {`);

    this.code.line(
      `const data = await axios.post('http://sandbox:8080', event)`
    );
    this.code.line();
    this.code.line(`}`);
  }

  public lambdaUzair(content:string) {
    return (
      `
        var AWS = require('aws-sdk');

        exports.handler = async (event: any) => {
        
        ${content}

        }
      
      `
    )
  }
}
