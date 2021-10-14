import { CodeMaker } from "codemaker";
import { APITYPE, ARCHITECTURE } from "../../../../utils/constants";

export class LambdaFunction {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public initializeLambdaFunction(
    apiType: APITYPE,
    apiName: string,
    content?: any,
    fieldName?: string,
    architecture?: ARCHITECTURE,
    nestedResolver?:boolean
  ) {
    if (apiType === APITYPE.graphql) {
      this.code.line(`var AWS = require('aws-sdk');`);
      if (architecture === ARCHITECTURE.eventDriven) {
        this.code.line(
          `const eventBridge = new AWS.EventBridge({ region: process.env.AWS_REGION });`
        );
      }
      this.code.line(`var isEqual = require('lodash.isequal');`);
      this.code.line();
      this.code.line(`exports.handler = async (event: any) => {`);
      if(nestedResolver){
        this.code.line(`console.log(event)`)
      }else{
        this.code.line(`let response = {};
        testCollections.fields.${fieldName}.forEach((v: any) => {
          if (v.arguments) {
            let equal = isEqual(
              Object.values(v.arguments)[0],
              Object.values(event.arguments)[0]
            );
            if (equal) {
              response = v.response;
            }
          } else {
            response = v.response;
          }
        });
        `);
      }

      if (architecture === ARCHITECTURE.eventDriven) {
        this.code.line(`
          await eventBridge
            .putEvents({
              Entries: [
                {
                  EventBusName: "default",
                  Source: "${apiName}",
                  Detail: JSON.stringify({ mutation: "${fieldName}" }),
                },
              ],
            })
            .promise();
            `);
      }

      this.code.line(`
          return response;
        `);
      // this.code.line(
      //   `const data = await axios.post('http://sandbox:8080', event)`
      // );
      // this.code.line(`}`);
      this.code.line();
      this.code.line(`};`);
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
    
    export const ${name} = async(events:any) => {
      // write your code here
      console.log(JSON.stringify(events, null, 2));
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
}
