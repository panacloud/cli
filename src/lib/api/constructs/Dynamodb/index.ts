import { CodeMaker } from "codemaker";
import { APITYPE, LAMBDASTYLE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
let maker = new CodeMaker();

export class Dynamodb extends CodeMaker {
    public initializeDynamodb(apiName: string) {
        const ts = new TypeScriptWriter();
        ts.writeVariableDeclaration(
          {
            name: `${apiName}_table`,
            typeName: "dynamodb.Table",
            initializer: () => {
              maker.line(` new dynamodb.Table(this, "${apiName}Table", {
              tableName: "${apiName}",
              billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
              partitionKey:{
                name: "id",
                type: dynamodb.AttributeType.STRING,
              }
            });`);
            },
          },
          "const",
          maker
        );
      }

      public grantFullAccess(
        lambda: string,
        tableName: string,
        lambdaStyle: string,
        functionName?: string
      ) {
        if (lambdaStyle === LAMBDASTYLE.single) {
          maker.line(
            `${tableName}.grantFullAccess(props!.${lambda}_lambdaFn);`
          );
        } else if (lambdaStyle === LAMBDASTYLE.multi) {
          maker.line(
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
          maker.line(
            `${dbConstructName}.table.grantFullAccess(${lambdaConstructName}.${apiName}_lambdaFn);`
          );
        } else if (lambdaStyle === LAMBDASTYLE.multi) {
          maker.line(
            `${dbConstructName}.table.grantFullAccess(${lambdaConstructName}.${apiName}_lambdaFn_${functionName});`
          );
        }
      }
    
      public initializeTestForDynamodb(TableName: string) {
        maker.line(`expect(actual).to(
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