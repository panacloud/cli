import { CodeMaker } from "codemaker";
import { APITYPE, CONSTRUCTS, LAMBDASTYLE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class DynamoDB {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }

  public initializeDynamodb(apiName: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_table`,
        typeName: "dynamodb.Table",
        initializer: () => {
          this.code.line(` new dynamodb.Table(this, "${apiName}Table", {
              tableName: "${apiName}",
              billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
              partitionKey:{
                name: "id",
                type: dynamodb.AttributeType.STRING,
              }
            });`);
        },
      },
      "const"
    );
  }

  public grantFullAccess(
    lambda: string,
    tableName: string,
    lambdaStyle: string,
    functionName?: string
  ) {
    if (lambdaStyle === LAMBDASTYLE.single) {
      this.code.line(
        `${tableName}.grantFullAccess(props!.${lambda}_lambdaFn);`
      );
    } else if (lambdaStyle === LAMBDASTYLE.multi) {
      this.code.line(
        `${tableName}.grantFullAccess(props!.${lambda}_lambdaFn_${functionName});`
      );
    }
  }

  public dynmaodbConstructInitializer(apiName: string, code: CodeMaker) {
    const ts = new TypeScriptWriter(code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_table`,
        typeName: CONSTRUCTS.dynamoDB,
        initializer: () => {
          this.code.line(
            `new ${CONSTRUCTS.dynamoDB}(this,"${apiName}${CONSTRUCTS.dynamoDB}")`
          );
        },
      },
      "const"
    );
  }

  public dbConstructLambdaAccess(
    apiName: string,
    dbConstructName: string,
    lambdaConstructName: string,
    lambdaStyle: string,
    apiType: string,
    functionName?: string
  ) {
    if (lambdaStyle === LAMBDASTYLE.single || apiType === APITYPE.rest) {
      this.code.line(
        `${dbConstructName}.table.grantFullAccess(${lambdaConstructName}.${apiName}_lambdaFn);`
      );
    } else if (lambdaStyle === LAMBDASTYLE.multi) {
      this.code.line(
        `${dbConstructName}.table.grantFullAccess(${lambdaConstructName}.${apiName}_lambdaFn_${functionName});`
      );
    }
  }

  public initializeTestForDynamodb(TableName: string) {
    this.code.line(`expect(actual).to(
          countResourcesLike("AWS::DynamoDB::Table",1, {
            KeySchema: [
              {
                AttributeName: "id",
                KeyType: "HASH",
              },
            ],
            AttributeDefinitions: [
              {
                AttributeName: "id",
                AttributeType: "S",
              },
            ],
            BillingMode: "PAY_PER_REQUEST",
            TableName: "${TableName}",
          })
        );
      `);
  }
}
