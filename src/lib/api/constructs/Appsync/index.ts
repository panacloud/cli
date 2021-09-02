import { CodeMaker } from "codemaker";
import { LAMBDASTYLE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
let maker = new CodeMaker()

interface Props {
  name: string;
  type: string;
}

export class Appsync extends CodeMaker {

  public apiName: string = "appsync_api";

  public initializeAppsyncApi(name: string,authenticationType?: string) {
    this.apiName = name;
    const ts = new TypeScriptWriter();
    ts.writeVariableDeclaration(
      {
        name: `${this.apiName}_appsync`,
        typeName: "appsync.CfnGraphQLApi",
        initializer: () => {
          this.line(`new appsync.CfnGraphQLApi(this,'${this.apiName}',{
          authenticationType:'API_KEY',
          name: '${this.apiName}',
        })`);
        },
      },
      "const",
       maker
    );
  }

  public initializeAppsyncSchema(schema: string) {
    const ts = new TypeScriptWriter();
    const gqlSchema = "`" + schema + "`";
    ts.writeVariableDeclaration(
      {
        name: `${this.apiName}_schema`,
        typeName: "appsync.CfnGraphQLSchema",
        initializer: () => {
          this.line(`new appsync.CfnGraphQLSchema(this,'${this.apiName}Schema',{
            apiId: ${this.apiName}_appsync.attrApiId,
            definition:${gqlSchema}
          })`);
        },
      },
      "const",
       maker
    );
  }

  public initializeApiKeyForAppsync(apiName: string) {
    this.line(`new appsync.CfnApiKey(this,"apiKey",{
        apiId:${apiName}_appsync.attrApiId
    })`);
  }

  public appsyncLambdaDataSource(dataSourceName: string,serviceRole: string,lambdaStyle:string,functionName?:string) {
    const ts = new TypeScriptWriter();
    let ds_initializerName = this.apiName + "dataSourceGraphql";
    let ds_variable = `ds_${dataSourceName}`;
    let ds_name = `${dataSourceName}_dataSource`;
    let lambdaFunctionArn = `props!.${this.apiName}_lambdaFnArn`;

    if (lambdaStyle === LAMBDASTYLE.multi) {
      ds_initializerName = this.apiName + "dataSourceGraphql" + functionName;
      ds_variable = `ds_${dataSourceName}_${functionName}`;
      ds_name = `${this.apiName}_dataSource_${functionName}`;
      lambdaFunctionArn = `props!.${this.apiName}_lambdaFn_${functionName}Arn`;
    }

    ts.writeVariableDeclaration(
      {
        name: ds_variable,
        typeName: "appsync.CfnDataSource",
        initializer: () => {
          this.line(`new appsync.CfnDataSource(this,'${ds_initializerName}',{
          name: "${ds_name}",
          apiId: ${this.apiName}_appsync.attrApiId,
          type:"AWS_LAMBDA",
          lambdaConfig: {lambdaFunctionArn:${lambdaFunctionArn}},
          serviceRoleArn:${serviceRole}_serviceRole.roleArn
         })`);
        },
      },
      "const",
       maker
    );
  }

  public appsyncLambdaResolver(
    fieldName: string,
    typeName: string,
    dataSourceName: string,
  ) {
    const ts = new TypeScriptWriter();
    ts.writeVariableDeclaration(
      {
        name: `${fieldName}_resolver`,
        typeName: "appsync.CfnResolver",
        initializer: () => {
          this.line(`new appsync.CfnResolver(this,'${fieldName}_resolver',{
            apiId: ${this.apiName}_appsync.attrApiId,
            typeName: "${typeName}",
            fieldName: "${fieldName}",
            dataSourceName: ${dataSourceName}.name
        })`);
        },
      },
      "const",
      maker
    );
  }

  public appsyncApiTest() {
    this.line(`expect(actual).to(
      countResourcesLike("AWS::AppSync::GraphQLApi",1, {
        AuthenticationType: "API_KEY",
        Name: "${this.apiName}",
      })
    );`);
    this.line();
    this.line(`expect(actual).to(
      countResourcesLike("AWS::AppSync::GraphQLSchema",1, {
        ApiId: {
          "Fn::GetAtt": [
            stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
             "ApiId"
          ],
        },
      })
    );`);
  }

  public appsyncApiKeyTest() {
    this.line(`expect(actual).to(
      haveResource("AWS::AppSync::ApiKey", {
        ApiId: {
          "Fn::GetAtt": [stack.getLogicalId(appsync_api[0] as cdk.CfnElement), "ApiId"],
        },
      })
    );
  `);
  }

  public appsyncDatasourceTest(
    dataSourceName: string,
    lambdaFuncIndex: number
  ) {
    this.line();
    this.line(`expect(actual).to(
      countResourcesLike("AWS::AppSync::DataSource",1, {
          ApiId: {
            "Fn::GetAtt": [stack.getLogicalId(appsync_api[0] as cdk.CfnElement), "ApiId"],
          },
          Name: "${dataSourceName}",
          Type: "AWS_LAMBDA",
          LambdaConfig: {
            LambdaFunctionArn: {
              "Fn::GetAtt": [
                stack.getLogicalId(
                  lambda_func[${lambdaFuncIndex}].node.defaultChild as cdk.CfnElement
                ),
                "Arn",
              ],
            },
          },
          ServiceRoleArn: {
            "Fn::GetAtt": [
              stack.getLogicalId(role[0].node.defaultChild as cdk.CfnElement),
              "Arn",
            ],
          },
        })
      );`);
  }

  public appsyncResolverTest(
    fieldName: string,
    typeName: string,
    dataSourceName: string
  ) {
    this.line(`expect(actual).to(
      countResourcesLike("AWS::AppSync::Resolver",1, {
          "ApiId": {
              "Fn::GetAtt": [
                stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
                "ApiId"
              ]
            },
            "FieldName": "${fieldName}",
            "TypeName": "${typeName}",    
            "DataSourceName": "${dataSourceName}"
        })
    );`);
  }
}
