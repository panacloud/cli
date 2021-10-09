import { CodeMaker } from "codemaker";
import { API, CONSTRUCTS, DATABASE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

interface Props {
  name: string;
  type: string;
}

export class Appsync {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }

  public apiName: string = "appsync_api";
  public initializeAppsyncApi(name: string, authenticationType?: string) {
    this.apiName = name;
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${this.apiName}_appsync`,
        typeName: "appsync.CfnGraphQLApi",
        initializer: () => {
          this.code.line(`new appsync.CfnGraphQLApi(this,'${this.apiName}',{
          authenticationType:'API_KEY',
          name: '${this.apiName}',
        })`);
        },
      },
      "const"
    );
  }

  public initializeAppsyncSchema(schema: string) {
    const ts = new TypeScriptWriter(this.code);
    const gqlSchema = "`" + schema + "`";
    ts.writeVariableDeclaration(
      {
        name: `${this.apiName}_schema`,
        typeName: "appsync.CfnGraphQLSchema",
        initializer: () => {
          this.code
            .line(`new appsync.CfnGraphQLSchema(this,'${this.apiName}Schema',{
            apiId: ${this.apiName}_appsync.attrApiId,
            definition:${gqlSchema}
          })`);
        },
      },
      "const"
    );
  }

  public initializeApiKeyForAppsync(apiName: string) {
    this.code.line(`new appsync.CfnApiKey(this,"apiKey",{
        apiId:${apiName}_appsync.attrApiId
    })`);
  }

  public appsyncConstructInitializer(config: API) {
    const { apiName } = config;
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}`,
        typeName: CONSTRUCTS.appsync,
        initializer: () => {
          this.code.line(
            `new ${CONSTRUCTS.appsync}(this,"${apiName}${CONSTRUCTS.appsync}",{`
          );
          this.appsyncDatabasePropsHandler(config, this.code);
          this.code.line("})");
        },
      },
      "const"
    );
  }

  public appsyncDatabasePropsHandler(config: API, code: CodeMaker) {
    const { apiName, queiresFields, mutationFields, database } = config;
    const mutationsAndQueries: string[] = [
      ...queiresFields!,
      ...mutationFields!,
    ];
    let apiLambda = apiName + "Lambda";
    let lambdafunc = `${apiName}_lambdaFn`;

    if (database === DATABASE.dynamoDB) {
      mutationsAndQueries.forEach((key: string) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        code.line(`${lambdafunc}Arn : ${apiLambda}.${lambdafunc}.functionArn,`);
      });
    } else {
      mutationsAndQueries.forEach((key: string) => {
        lambdafunc = `${apiName}_lambdaFn_${key}Arn`;
        code.line(`${lambdafunc} : ${apiLambda}.${lambdafunc},`);
      });
    }
  }

  public appsyncLambdaDataSource(
    dataSourceName: string,
    serviceRole: string,
    functionName: string
  ) {
    const ts = new TypeScriptWriter(this.code);

    const ds_initializerName =
      this.apiName + "dataSourceGraphql" + functionName;
    const ds_variable = `ds_${dataSourceName}_${functionName}`;
    const ds_name = `${this.apiName}_dataSource_${functionName}`;
    const lambdaFunctionArn = `props!.${this.apiName}_lambdaFn_${functionName}Arn`;

    ts.writeVariableDeclaration(
      {
        name: ds_variable,
        typeName: "appsync.CfnDataSource",
        initializer: () => {
          this.code
            .line(`new appsync.CfnDataSource(this,'${ds_initializerName}',{
          name: "${ds_name}",
          apiId: ${this.apiName}_appsync.attrApiId,
          type:"AWS_LAMBDA",
          lambdaConfig: {lambdaFunctionArn:${lambdaFunctionArn}},
          serviceRoleArn:${serviceRole}_serviceRole.roleArn
         })`);
        },
      },
      "const"
    );
  }

  public appsyncLambdaResolver(
    fieldName: string,
    typeName: string,
    dataSourceName: string
  ) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${fieldName}_resolver`,
        typeName: "appsync.CfnResolver",
        initializer: () => {
          this.code.line(`new appsync.CfnResolver(this,'${fieldName}_resolver',{
            apiId: ${this.apiName}_appsync.attrApiId,
            typeName: "${typeName}",
            fieldName: "${fieldName}",
            dataSourceName: ${dataSourceName}.name
        })`);
        },
      },
      "const"
    );
  }

  public appsyncTestConstructInitializer(
    apiName: string,
    database: string,
    mutationsAndQueries: string[]
  ) {
    let lambdafunc = `${apiName}_lambdaFn`;
    this.code.line(
      `const ${CONSTRUCTS.appsync}_stack = new ${CONSTRUCTS.appsync}(stack, "${CONSTRUCTS.appsync}Test", {`
    );
    if (database === DATABASE.dynamoDB) {
      mutationsAndQueries.forEach((key) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        this.code.line(
          `${lambdafunc}Arn : ${CONSTRUCTS.lambda}_stack.${lambdafunc}.functionArn,`
        );
      });
    } else {
      mutationsAndQueries.forEach((key) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        this.code.line(
          `${lambdafunc}Arn : ${CONSTRUCTS.lambda}_stack.${lambdafunc}Arn,`
        );
      });
    }
    this.code.line(`})`);
  }

  public appsyncApiTest() {
    this.code.line(`expect(stack).toHaveResource("AWS::AppSync::GraphQLApi", {
      AuthenticationType: "API_KEY",
      Name: "${this.apiName}",
    })`);
    this.code.line();
    this.code
      .line(`expect(stack).toHaveResource("AWS::AppSync::GraphQLSchema", {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
    })
`);
  }

  public appsyncApiKeyTest() {
    this.code.line(`expect(stack).toHaveResource("AWS::AppSync::ApiKey", {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
    })
  `);
  }

  public appsyncDatasourceTest(
    dataSourceName: string,
    lambdaFuncIndex: number
  ) {
    this.code.line();
    this.code.line(`expect(stack).toHaveResource("AWS::AppSync::DataSource", {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
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
`);
  }

  public appsyncResolverTest(
    fieldName: string,
    typeName: string,
    dataSourceName: string
  ) {
    this.code.line(`expect(stack).toHaveResource("AWS::AppSync::Resolver", {
      ApiId: {
        "Fn::GetAtt": [
          stack.getLogicalId(appsync_api[0] as cdk.CfnElement),
          "ApiId",
        ],
      },
      FieldName: "${fieldName}",
      TypeName: "${typeName}",
      DataSourceName: "${dataSourceName}",
    })
`);
  }
}
