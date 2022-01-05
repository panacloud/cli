import { CodeMaker } from "codemaker";
import { GraphQLSchema } from "graphql";
import {
  APITYPE,
  DATABASE,
  mockApiData,
  NEPTUNEQUERYLANGUAGE,
} from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { RootMockObject, TestCollectionType } from "../../apiMockDataGenerator";
import { transformStr } from "./utills";

export class LambdaFunction {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public initializeLambdaFunction(
    apiType: APITYPE,
    apiName: string,
    content?: ()=>void,
    fieldName?: string,
    nestedResolver?: boolean,
    asyncField?: Boolean
  ) {
    if (apiType === APITYPE.graphql) {
      const ts = new TypeScriptWriter(this.code);
      ts.writeAllImports("aws-sdk", "* as AWS");
      ts.writeImports("aws-lambda", ["AppSyncResolverEvent"]);
      if (asyncField) {
        this.code.line(
          `var eventBridge = new AWS.EventBridge({ region: process.env.AWS_REGION });`
        );
      }
      this.code.line(`var isEqual = require('lodash.isequal');`);
      this.code.line();
      this.code.line(
        `exports.handler = async (event: AppSyncResolverEvent<any>) => {`
      );
      if (nestedResolver) {
        this.code.line(`console.log(event)`);
      } else {
        this.code.line(`let response = {};
        data.testCollections.fields.${fieldName}.forEach((v: any) => {
          if (v.arguments) {
            let equal = isEqual(
              v.arguments,
              event.arguments
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

      if (asyncField) {
        this.code.line(`
          await eventBridge
            .putEvents({
              Entries: [
                {
                  EventBusName: "default",
                  Source: "${apiName}",
                  Detail: JSON.stringify({ mutation: "${fieldName}", response: response }),
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
      // this.code.line(
      //   `const data = await axios.post('http://sandbox:8080', event)`
      // );
      this.code.line(`try {`);
      this.code.line();
      this.code.line("const method = event.httpMethod;");
      this.code.line(
        "const requestName = event.path.startsWith('/') ? event.path.substring(1) : event.path;"
      );
      this.code.line("const body = JSON.parse(event.body);");
      content && content();
      this.code.line();
      this.code.line(`}`);
      this.code.line("catch(err) {");
      this.code.line("return err;");
      this.code.line(`}`);
      this.code.line(`}`);
    }
  }

  public helloWorldFunction(
    name: string,
    database: DATABASE,
    neptuneQueryLanguage?: NEPTUNEQUERYLANGUAGE,
    mockData?: mockApiData,
    queryName?: string
  ) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeAllImports("aws-sdk", "* as AWS");
    ts.writeImports("aws-lambda", ["AppSyncResolverEvent"]);
    this.code.line();
    if (database === DATABASE.auroraDB) {
      ts.writeVariableDeclaration(
        {
          name: "db",
          typeName: "",
          initializer: () => {
            this.code.line(`require("data-api-client")({
              secretArn: process.env.SECRET_ARN,
              resourceArn: process.env.CLUSTER_ARN,
              database: process.env.DB_NAME,
            })`);
          },
        },
        "const"
      );
    }
    if (
      database === DATABASE.neptuneDB &&
      neptuneQueryLanguage === NEPTUNEQUERYLANGUAGE.gremlin
    ) {
      ts.writeVariableDeclaration(
        {
          name: "initGremlin",
          typeName: "",
          initializer: () => {
            this.code.line(`require("/opt/utils/gremlin_init")`);
          },
        },
        "const"
      );
    }
    this.code.line(`
    exports.handler = async(events:AppSyncResolverEvent<any>) => {
    `);
    if (database === DATABASE.neptuneDB) {
      if (neptuneQueryLanguage === NEPTUNEQUERYLANGUAGE.cypher) {
        this.code.line(
          `const url = 'https://' + process.env.NEPTUNE_ENDPOINT + ':8182/openCypher';`
        );
      } else {
        this.code.line(`
        const { g, conn } = initGremlin.initializeGremlinClient(
          process.env.NEPTUNE_ENDPOINT!
        );
        `);
      }
    }
    this.code.line(`
      // write your code here
      console.log(JSON.stringify(events, null, 2));
      `);
    this.code.line("}");
  }

  public emptyLambdaFunction(
    nestedResolver?: boolean,
    database?: DATABASE,
    neptuneQueryLanguage?: NEPTUNEQUERYLANGUAGE,
    isMutation?: boolean,
    mockData?: mockApiData,
    queryName?: string,
    isService?: boolean,
    gqlSchema?: GraphQLSchema
  ) {
    // let returnType = "";
    const mockObject = new RootMockObject(gqlSchema!);
    const dummyData: TestCollectionType = { fields: {} };
    mockObject.write(dummyData);
    const enumPattern = /"[a-zA-Z_]+[.][a-zA-Z_]+"/g;
    let mockDataStr = "";
    if (
      dummyData &&
      dummyData.fields[queryName!] &&
      dummyData.fields[queryName!].length > 0
    ) {
      mockDataStr = `${JSON.stringify(
        dummyData.fields[queryName!][0].response
      )}`;
      const matchEnums = mockDataStr.match(enumPattern);

      matchEnums?.forEach((enumStr) => {
        mockDataStr = mockDataStr.replace(enumStr, enumStr.slice(1, -1));
      });
    }
    const ts = new TypeScriptWriter(this.code);
    const path = isService
      ? "../../../customMockLambdaLayer/mockData/types"
      : "../../customMockLambdaLayer/mockData/types";

    ts.writeAllImports("aws-sdk", "* as AWS");
    ts.writeImports("aws-lambda", ["AppSyncResolverEvent"]);

    const argType =
      typeof mockData?.types[queryName!].fields[queryName!][0]?.arguments ===
        "string" &&
      mockData?.types[queryName!].fields[queryName!][0].arguments
        .split("_")
        .reduce(
          (out_str: string, val: string, index: number, arr: string[]) => {
            return (out_str += `${transformStr(val)}${
              arr.length > index + 1 ? "_" : ""
            }`);
          },
          ""
        );
    if (
      mockData &&
      mockData?.enumImports &&
      mockData?.enumImports.length !== 0
    ) {
      ts.writeImports(path, [...mockData?.enumImports!]);
    }
    if (mockData?.imports) {
      if (
        typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
        "string"
      ) {
        ts.writeImports(path, [argType]);
      }
    }

    // switch (mockData?.types[queryName!].fields[queryName!][0].response) {
    //   case "ID":
    //     returnType = `Scalars["ID"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "String":
    //     returnType = `Scalars["String"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "Boolean":
    //     returnType = `Scalars["Boolean"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "Int":
    //     returnType = `Scalars["Int"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "Float":
    //     returnType = `Scalars["Float"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSDate":
    //     returnType = `Scalars["AWSDate"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSDateTime":
    //     returnType = `Scalars["AWSDateTime"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSEmail":
    //     returnType = `Scalars["AWSEmail"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSIPAddress":
    //     returnType = `Scalars["AWSIPAddress"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSJSON":
    //     returnType = `Scalars["AWSJSON"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSPhone":
    //     returnType = `Scalars["AWSPhone"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSTime":
    //     returnType = `Scalars["AWSTime"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSTimestamp":
    //     returnType = `Scalars["AWSTimestamp"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   case "AWSURL":
    //     returnType = `Scalars["AWSURL"]`;
    //     ts.writeImports(path, ["Scalars"]);
    //     break;
    //   default:
    //     returnType = `${mockData?.types[queryName!].fields[
    //       queryName!
    //     ][0].response
    //       .split("_")
    //       .reduce(
    //         (out_str: string, val: string, index: number, arr: string[]) => {
    //           if (val.includes("|")) {
    //             let commaStr = val
    //               .split("|")
    //               .reduce((outStr, val, index: number, arr: string[]) => {
    //                 val = val.replace(" ", "");

    //                 return (outStr += `${val
    //                   .charAt(0)
    //                   .toUpperCase()}${lodash.camelCase(val.slice(1))}${
    //                   arr.length > index + 1 ? "|" : ""
    //                 }`);
    //               }, "");
    //             return (out_str += commaStr);
    //           }
    //           if (val.includes("[]")) {
    //             let commaStr = val
    //               .split("[]")
    //               .reduce((outStr, val, index: number, arr: string[]) => {
    //                 val = val.replace(" ", "");

    //                 return (outStr += `${val
    //                   .charAt(0)
    //                   .toUpperCase()}${lodash.camelCase(val.slice(1))}${
    //                   arr.length > index + 1 ? "[]" : ""
    //                 }`);
    //               }, "");
    //             return (out_str += commaStr);
    //           }
    //           return (out_str += `${val
    //             .charAt(0)
    //             .toUpperCase()}${lodash.camelCase(val.slice(1))}${
    //             arr.length > index + 1 ? "_" : ""
    //           }`);
    //         },
    //         ""
    //       )}`;

    //     ts.writeImports(path, [
    //       `${mockData?.types[queryName!].fields[queryName!][0].response
    //         .replace(/[\[\]']+/g, "")
    //         .replace("|", ",")
    //         .split("_")
    //         .reduce(
    //           (out_str: string, val: string, index: number, arr: string[]) => {
    //             if (val.includes(",")) {
    //               let commaStr = val
    //                 .split(",")
    //                 .reduce((outStr, val, index: number, arr: string[]) => {
    //                   val = val.replace(" ", "");

    //                   return (outStr += `${val
    //                     .charAt(0)
    //                     .toUpperCase()}${lodash.camelCase(val.slice(1))}${
    //                     arr.length > index + 1 ? "," : ""
    //                   }`);
    //                 }, "");
    //               return (out_str += commaStr);
    //             }
    //             return (out_str += `${val
    //               .charAt(0)
    //               .toUpperCase()}${lodash.camelCase(val.slice(1))}${
    //               arr.length > index + 1 ? "_" : ""
    //             }`);
    //           },
    //           ""
    //         )}`,
    //     ]);
    //     break;
    // }
    if (database === DATABASE.dynamoDB) {
    
      ts.writeVariableDeclaration(
        {
          name: "docClient",
          typeName: "",
          initializer: () => {
            this.code.line(`new AWS.DynamoDB.DocumentClient()`);
          },
        },
        "const"
      );

      this.code.line(`declare var process: {
              env: {
                TableName: string;
              };
            };`);
             
    }
    if (database === DATABASE.auroraDB) {
      ts.writeVariableDeclaration(
        {
          name: "db",
          typeName: "",
          initializer: () => {
            this.code.line(`require("data-api-client")({
              secretArn: process.env.SECRET_ARN,
              resourceArn: process.env.CLUSTER_ARN,
              database: process.env.DB_NAME,
            })`);
          },
        },
        "const"
      );
    }
    if (
      database === DATABASE.neptuneDB &&
      neptuneQueryLanguage === NEPTUNEQUERYLANGUAGE.gremlin
    ) {
      ts.writeImports("gremlin", ["process as gprocess"]);
      ts.writeVariableDeclaration(
        {
          name: "initGremlin",
          typeName: "",
          initializer: () => {
            this.code.line(`require("/opt/utils/gremlin_init")`);
          },
        },
        "const"
      );
    }

    this.code.line();
    this.code.line(
      `exports.handler = async (event: AppSyncResolverEvent<${
        typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
        "string"
          ? argType
          : "null"
      }>) => {`
    );
    if (database === DATABASE.dynamoDB) {
      if (
        typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
        "string"
      ) {
        this.code.line(`const result = await ${queryName}(event.arguments);`);
      } else {
        this.code.line(`const result = await ${queryName}();`);
      }

      this.code.line("return result");
    }
    if (database === DATABASE.auroraDB) {
      if (
        typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
        "string"
      ) {
        this.code.line(`const result = await ${queryName}(event.arguments);`);
      } else {
        this.code.line(`const result = await ${queryName}();`);
      }

      this.code.line("return result");
     
     
    }
    if (database === DATABASE.neptuneDB) {
      if (neptuneQueryLanguage === NEPTUNEQUERYLANGUAGE.cypher) {
        this.code.line(
          `const url = 'https://' + process.env.NEPTUNE_ENDPOINT + ':8182/openCypher';`
        );
        this.code.line(`const result = ${queryName}(event.arguments,url);`);
      } else {
        this.code.line(`
        const { g, conn } = initGremlin.initializeGremlinClient(
          process.env.NEPTUNE_ENDPOINT!
        );
        `);
        if (
          typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
          "string"
        ) {
          this.code.line(
            `const result = await ${queryName}(event.arguments,g);`
          );
        } else {
          this.code.line(`const result = await ${queryName}(g);`);
        }
      }
      this.code.line("return result");
    
    }

    // this.code.line(
    //   `const data = await axios.post('http://sandbox:8080', event)`
    // );
    // this.code.line(`console.log(JSON.stringify(event,null,2))`);
    // if (nestedResolver) {
    //   this.code.line(`return event.source![event.info.fieldName]`);
    // }
    this.code.line();
    this.code.line(`}`);
    this.code.line();
    if (database === DATABASE.neptuneDB) {
      if (neptuneQueryLanguage === NEPTUNEQUERYLANGUAGE.gremlin) {
        if (
          typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
          "string"
        ) {
          this.code.line(
            `async function ${queryName}(args:${argType},g:gprocess.GraphTraversalSource)
              {`
          );
        } else {
          this.code.line(
            `async function ${queryName}(g:gprocess.GraphTraversalSource)
            {`
          );
        }

        this.code.line();
        this.code.line("// Write your buisness logic here ");
        this.code.line();

        this.code.line("// Example Schema: ");
        this.code.line(`
        // type User {
        //   id: ID!
        //   name: String!
        //   age: Int!
        // }
        
        // input userInput {
        //   name: String!
        //   age: Int!
        // }

        // type Query {
        //   listUsers: [User!]
        // }
        
        // type Mutation {
        //   createUser(user: userInput!): String
        // }
        `);

        this.code.line(`// Example Code: `);

        if (!isMutation) {
          this.code.line(` 
        // try {
        //   let data = await g.V().hasLabel('user').toList()
        //   let users = Array()
    
        //   for (const v of data) {
        //     const _properties = await g.V(v.id).properties().toList()
        //     let user = _properties.reduce((acc, next) => {
        //       acc[next.label] = next.value
        //       return acc
        //     }, {})
        //     user.id = v.id
        //     users.push(post)
        //   }
        //   return users
        // } catch (err) {
        //     console.log('ERROR', err)
        //     return null
        // }
        `);
        } else {
          this.code.line(`
          //  await g.addV('user').property('name', 'John').property('age', 20)
        `);
          this.code.line(`// return args.user.name;`);
        }
        this.code.line(`return ${mockDataStr}`);
        this.code.line("}");
      } else {
        if (
          typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
          "string"
        ) {
          this.code.line(
            `async function ${queryName}(args:${argType},url:string)
            {`
          );
        } else {
          this.code.line(
            `async function ${queryName}(url:string)
            {`
          );
        }

        this.code.line();
        this.code.line("// Write your buisness logic here ");
        this.code.line();

        this.code.line("// Example Schema: ");
        this.code.line(`
        // type User {
        //   id: ID!
        //   name: String!
        //   age: Int!
        // }
        
        // input userInput {
        //   name: String!
        //   age: Int!
        // }

        // type Query {
        //   listUsers: [User!]
        // }
        
        // type Mutation {
        //   createUser(user: userInput!): String
        // }
        `);
        this.code.line();
        if (!isMutation) {
          this.code.line("// let query = `MATCH (n:user) RETURN n`;");
          this.code.line("// try {");
          this.code.line(
            "// const fetch = await axios.post(url, `query=${query}`);"
          );
          this.code.line(`
            //   const result = JSON.stringify(fetch.data.results);
            //   const data = JSON.parse(result);
            
            //   let modifiedData = Array();
            //   for (const [i, v] of data.entries()) {
            //     //for each vertex
            //     let obj = {
            //       id: data[i].n["~id"],
            //       ...data[i].n["~properties"],
            //     };
            
            //     modifiedData.push(obj);
            //   }
            
            //   return modifiedData;
            `);
          this.code.line("// }");
          this.code.line(`// catch (err) {
              //   console.log("ERROR", err);
              //   return null;
              // }`);
        } else {
          this.code.line(
            "// let query = `CREATE (:user {id: '01', name: '${user.name}', age: ${user.age}})`;"
          );
          this.code.line("// try {");
          this.code.line("// await axios.post(url, `query=${query}`);");
          this.code.line("// return user.name;");
          this.code.line("// }");
          this.code.line(`  
          // catch (err) {
          //   console.log("ERROR", err);
          //   return null;
          // }`);
        }
        this.code.line(`// Example Code: `);
        this.code.line(`return ${mockDataStr}`);
        this.code.line("}");
      }
    } else if (database === DATABASE.dynamoDB) {
      if (
        typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
        "string"
      ) {
        this.code.line(
          `async function ${queryName}(args:${argType})
          {`
        );
      } else {
        this.code.line(
          `async function ${queryName}()
          {`
        );
      }

      this.code.line();
      this.code.line("// Write your buisness logic here ")
      this.code.line()
      this.code.line("// Example Schema: ");
      this.code.line(`
        // type User {
        //   id: ID!
        //   name: String!
        //   age: Int!
        // }
        
        // input userInput {
        //   name: String!
        //   age: Int!
        // }

        // type Query {
        //   listUsers: [User!]
        // }
        
        // type Mutation {
        //   createUser(user: userInput!): String
        // }
        `);

      this.code.line(`// Example Code: `);
      this.code.line();

      this.code.line("// try{");
      if (!isMutation) {
        this.code.line("// const params = {TableName:process.env.TableName}");
        this.code.line(
          "//   const data = await docClient.scan(params).promise()"
        );
        this.code.line("// return data.Items");
      } else {
        this.code.line(
          "// const params = {TableName:process.env.TableName, Item: args.user}"
        );

        this.code.line("// await docClient.put(params).promise()");
        this.code.line(" //return args.user.name");
      }
      this.code.line("// }");
      this.code.openBlock("// catch (err) ");
      this.code.line("// console.log('ERROR', err)");
      this.code.line("// return null");
      this.code.line("// }");

      this.code.line(`return ${mockDataStr}`);

      this.code.line("}");
    } else if (database === DATABASE.auroraDB) {
      if (
        typeof mockData?.types[queryName!].fields[queryName!][0].arguments ===
        "string"
      ) {
        this.code.line(
          `async function ${queryName}(args:${argType})
          {`
        );
      } else {
        this.code.line(
          `async function ${queryName}()
          {`
        );
      }

      this.code.line();
      this.code.line("// Write your buisness logic here ");

      this.code.line();

      this.code.line("// Example Schema: ");
      this.code.line(`
        // type User {
        //   id: ID!
        //   name: String!
        //   age: Int!
        // }
        
        // input userInput {
        //   name: String!
        //   age: Int!
        // }

        // type Query {
        //   listUsers: [User!]
        // }
        
        // type Mutation {
        //   createUser(user: userInput!): String
        // }
        `);

      this.code.line(`// Example Code: `);
      this.code.line();
      this.code.line("// try{");
      if (!isMutation) {
        this.code.line("// const query = `SELECT * FROM users`;");
        this.code.line("// const data = await db.query(query)");
        this.code.line("// return data");
      } else {
        this.code.line(
          "// const query = `INSERT INTO users (name,age) VALUES(:name,:age)`;"
        );
        this.code.line("// await db.query(query, { name:'John', age:20 })");
        this.code.line(" //return args.user.name");
      }
      this.code.line("// }");
      this.code.openBlock("// catch (err) ");
      this.code.line("// console.log('ERROR', err)");
      this.code.line("// return null");
      this.code.line("// }");

      this.code.line(`return ${mockDataStr}`);

      this.code.line("}");
    }
  }

  public appsyncMutationInvokeFunction() {
    const ts = new TypeScriptWriter(this.code);
    ts.writeAllImports("axios", "axios");
    ts.writeAllImports("aws-sdk", "* as AWS");
    ts.writeImports("aws-lambda", ["EventBridgeEvent"]);

    this.code.line(`
    export const handler = async(events: EventBridgeEvent<string, any>) => {
      
    const query = \`
      mutation MyMutation {
        async_response (input: \${JSON.stringify( events.detail || {} )} )
      }
    \`;

    await axios.post(
      process.env.APPSYNC_API_END_POINT!,
      JSON.stringify({ query }),
      { headers: { "content-type": "application/json", "x-api-key": process.env.APPSYNC_API_KEY, } }
    );

    }
    `);
  }
}
