import { CodeMaker } from "codemaker";
import { APITYPE, LAMBDASTYLE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
let maker = new CodeMaker();

export class DynamoDB extends CodeMaker {
  public initializeDynamodb(apiName: string) {
    const ts = new TypeScriptWriter(maker);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_table`,
        typeName: "dynamodb.Table",
        initializer: () => {
          this.line(` new dynamodb.Table(this, "${apiName}Table", {
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
      this.line(`${tableName}.grantFullAccess(props!.${lambda}_lambdaFn);`);
    } else if (lambdaStyle === LAMBDASTYLE.multi) {
      this.line(
        `${tableName}.grantFullAccess(props!.${lambda}_lambdaFn_${functionName});`
      );
    }
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
      this.line(
        `${dbConstructName}.table.grantFullAccess(${lambdaConstructName}.${apiName}_lambdaFn);`
      );
    } else if (lambdaStyle === LAMBDASTYLE.multi) {
      this.line(
        `${dbConstructName}.table.grantFullAccess(${lambdaConstructName}.${apiName}_lambdaFn_${functionName});`
      );
    }
  }

  public initializeTestForDynamodb(TableName: string) {
    this.line(`expect(actual).to(
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
