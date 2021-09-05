import { CodeMaker } from "codemaker";
import { APITYPE, Config, CONSTRUCTS, DATABASE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { apiManager } from "../../constructs/ApiManager";
import { Cdk } from "../../constructs/Cdk";
import { importHandlerForStack, LambdaAccessHandler, lambdaConstructPropsHandlerAuroradb, lambdaConstructPropsHandlerNeptunedb, lambdaPropsHandlerDynamodb, propsHandlerForApiGatewayConstruct, propsHandlerForAppsyncConstructDynamodb, propsHandlerForAppsyncConstructNeptunedb } from "./functions";
const _ = require("lodash");

type StackBuilderProps = {
  config: Config;
};

export class CdkStack {
  outputFile: string = `index.ts`;
  outputDir: string = `lib`;
  config: Config;
  jsonSchema: any;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async CdkStackFile() {
    const ts = new TypeScriptWriter(this.code);
    this.outputFile = `${this.config.workingDir}-stack.ts`
    this.code.openFile(this.outputFile);
    const { apiName,database,lambdaStyle,apiType } = this.config.api;
    let mutations = {};
    let queries = {};
    if (apiType === APITYPE.graphql) {
      mutations = this.config.type.Mutation ? this.config.type.Mutation : {};
      queries = this.config.type.Query ? this.config.type.Query : {};
    }
    const mutationsAndQueries = { ...mutations, ...queries };
    const cdk = new Cdk(this.code);
    const manager = new apiManager(this.code);
    importHandlerForStack(database,apiType,this.code)
    this.code.line();

    cdk.initializeStack(
        `${_.upperFirst(_.camelCase(this.config.workingDir))}`,
        ()=>{
            manager.apiManagerInitializer(apiName);
            this.code.line();
            if (database == DATABASE.dynamo) {
              ts.writeVariableDeclaration(
                {
                  name: `${apiName}_table`,
                  typeName: CONSTRUCTS.dynamodb,
                  initializer: () => {
                    this.code.line(
                      `new ${CONSTRUCTS.dynamodb}(this,"${apiName}${CONSTRUCTS.dynamodb}")`
                    );
                  },
                },
                "const"
              );
              this.code.line();
            } else if (database == DATABASE.neptune) {
              ts.writeVariableDeclaration({
                name:`${apiName}_neptunedb`,
                typeName:CONSTRUCTS.neptuneDb,
                initializer:()=>{
                  this.code.line(`new ${CONSTRUCTS.neptuneDb}(this,"${apiName}${CONSTRUCTS.neptuneDb}")`)
                }},
               "const")
              this.code.line();
            } else if (database == DATABASE.aurora) {
              ts.writeVariableDeclaration({
                name:`${apiName}_auroradb`,
                typeName:CONSTRUCTS.auroradb,
                initializer:()=>{
                  this.code.line(`new ${CONSTRUCTS.auroradb}(this,"${CONSTRUCTS.auroradb}");`)
                }
              },"const")
              this.code.line();
            }
            ts.writeVariableDeclaration(
              {
                name: `${apiName}Lambda`,
                typeName: CONSTRUCTS.lambda,
                initializer: () => {
                  this.code.line(
                    `new ${CONSTRUCTS.lambda}(this,"${apiName}${CONSTRUCTS.lambda}",{`
                  );
                  database === DATABASE.dynamo && lambdaPropsHandlerDynamodb(this.code, `${apiName}_table`);
                  database === DATABASE.neptune && lambdaConstructPropsHandlerNeptunedb(this.code, apiName);
                  database === DATABASE.aurora && lambdaConstructPropsHandlerAuroradb(this.code, apiName);
                this.code.line("})");
                },
              },
              "const"
            );
            database === DATABASE.dynamo && LambdaAccessHandler( this.code, apiName, lambdaStyle ,apiType, mutationsAndQueries)
            
            if (apiType === APITYPE.graphql) {
              ts.writeVariableDeclaration(
                {
                  name: `${apiName}`,
                  typeName: CONSTRUCTS.appsync,
                  initializer: () => {
                    this.code.line(
                      `new ${CONSTRUCTS.appsync}(this,"${apiName}${CONSTRUCTS.appsync}",{`
                    );
                    database === DATABASE.dynamo && propsHandlerForAppsyncConstructDynamodb(this.code,apiName,lambdaStyle,mutationsAndQueries);
                    database === DATABASE.neptune && propsHandlerForAppsyncConstructNeptunedb(this.code,apiName,lambdaStyle,mutationsAndQueries);
                    database === DATABASE.aurora &&  propsHandlerForAppsyncConstructNeptunedb(this.code,apiName,lambdaStyle,mutationsAndQueries);
                    this.code.line("})");
                  },
                },
                "const"
              );
            }

            if (apiType === APITYPE.rest) {
              this.code.line(
                `const ${apiName} = new ${CONSTRUCTS.apigateway}(this,"${apiName}${CONSTRUCTS.apigateway}",{`
              );
              propsHandlerForApiGatewayConstruct(this.code, apiName);
              this.code.line("})");
            }
        }
    )
    
    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const CdkStackClass = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new CdkStack(props);
  await builder.CdkStackFile();
};
