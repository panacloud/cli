import { CodeMaker } from "codemaker";
import { CONSTRUCTS, DATABASE, LAMBDASTYLE, TEMPLATE } from "../../../../utils/constants";
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

  public appsyncConstructInitializer(
    apiName: string,
    lambdaStyle: string,
    database: string,
    mutationsAndQueries: any,
    template:string,
    code: CodeMaker
  ) {
    const ts = new TypeScriptWriter(code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}`,
        typeName: CONSTRUCTS.appsync,
        initializer: () => {
          this.code.line(
            `new ${CONSTRUCTS.appsync}(this,"${apiName}${CONSTRUCTS.appsync}",{`
          );
          this.appsyncDatabasePropsHandler(
            apiName,
            lambdaStyle,
            database,
            mutationsAndQueries,
            template,
            code
          );
          this.code.line("})");
        },
      },
      "const"
    );
  }

  public appsyncDatabasePropsHandler(
    apiName: string,
    lambdaStyle: string,
    database: string,
    mutationsAndQueries: any,
    template:string,
    code: CodeMaker
  ) {
    let apiLambda = apiName + "Lambda";
    let lambdafunc = `${apiName}_lambdaFn`;
    if (lambdaStyle === LAMBDASTYLE.single && database === DATABASE.dynamoDB) {
      code.line(`${lambdafunc}Arn : ${apiLambda}.${lambdafunc}.functionArn`);
    }
    if (lambdaStyle === LAMBDASTYLE.multi && database === DATABASE.dynamoDB) {
      mutationsAndQueries.forEach((key:string) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        code.line(`${lambdafunc}Arn : ${apiLambda}.${lambdafunc}.functionArn,`);
      });
    }
    if (
      lambdaStyle === LAMBDASTYLE.single &&
      (database === DATABASE.neptuneDB || database === DATABASE.auroraDB)
    ) {
      lambdafunc = `${apiName}_lambdaFnArn`;
      code.line(`${lambdafunc} : ${apiLambda}.${lambdafunc}`);
    }
    if (
      lambdaStyle === LAMBDASTYLE.multi &&
      (database === DATABASE.neptuneDB || database === DATABASE.auroraDB || template === TEMPLATE.mockApi)
    ) {
      mutationsAndQueries.forEach((key:string) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        code.line(`${lambdafunc}Arn : ${apiLambda}.${lambdafunc}Arn,`);
      });
    }
  }

  public appsyncLambdaDataSource(
    dataSourceName: string,
    serviceRole: string,
    lambdaStyle: string,
    functionName?: string
  ) {
    const ts = new TypeScriptWriter(this.code);
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
    lambdaStyle: string,
    database: string,
    mutationsAndQueries: any,
    code: CodeMaker
  ) {
    let lambdafunc = `${apiName}_lambdaFn`;
    this.code.line(
      `const ${CONSTRUCTS.appsync}_stack = new ${CONSTRUCTS.appsync}(stack, "${CONSTRUCTS.appsync}Test", {`
    );
    if (lambdaStyle === LAMBDASTYLE.single && database === DATABASE.dynamoDB) {
      code.line(
        `${lambdafunc}Arn : ${CONSTRUCTS.lambda}_stack.${lambdafunc}.functionArn`
      );
    }
    else if (lambdaStyle === LAMBDASTYLE.multi && database === DATABASE.dynamoDB) {
      Object.keys(mutationsAndQueries).forEach((key) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        code.line(
          `${lambdafunc}Arn : ${CONSTRUCTS.lambda}_stack.${lambdafunc}.functionArn,`
        );
      });
    }
    if (
      lambdaStyle === LAMBDASTYLE.single &&
      (database === DATABASE.neptuneDB || database === DATABASE.auroraDB)
    ) {
      lambdafunc = `${apiName}_lambdaFnArn`;
      code.line(`${lambdafunc} : ${CONSTRUCTS.lambda}_stack.${lambdafunc}`);
    }
    else if (
      lambdaStyle === LAMBDASTYLE.multi &&
      (database === DATABASE.neptuneDB || database === DATABASE.auroraDB)
    ) {
      Object.keys(mutationsAndQueries).forEach((key) => {
        lambdafunc = `${apiName}_lambdaFn_${key}`;
        code.line(`${lambdafunc}Arn : ${CONSTRUCTS.lambda}_stack.${lambdafunc}Arn,`);
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
