import { CodeMaker } from "codemaker";
import { LAMBDASTYLE, APITYPE, ARCHITECTURE } from "../../../../utils/constants";

export class LambdaFunction {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public initializeLambdaFunction(
    lambdaStyle: string,
    apiType: APITYPE,
    mockApi?: boolean,
    fieldName?: string,
    content?: any
  ) {

    if (apiType === APITYPE.graphql) {
       if (lambdaStyle === LAMBDASTYLE.multi) {
        this.code.line(`var AWS = require('aws-sdk')`);
        this.code.line();
        this.code.line(`exports.handler = async (event: any) => {`);
        if (!mockApi) {
          this.code.line(
            `const data = await axios.post('http://sandbox:8080', event)`
          );
        } else {
          this.code.line(`
          let response = {}
          data.testCollections.fields.${fieldName}.forEach((item:any) => {
             if(JSON.stringify(item.arguments) == JSON.stringify(event.arguments)){
                response = item.response
             }  
          })
        return response
        `);
        }
        this.code.line();
        this.code.line(`}`);
      } else if (lambdaStyle === LAMBDASTYLE.single) {
        
        this.code.line(`exports.handler = async (event:Event) => {`);
        if(!mockApi){
          this.code.line(
            `const data = await axios.post('http://sandbox:8080', event)`
          );  
        }
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
