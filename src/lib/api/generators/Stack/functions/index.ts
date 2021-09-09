import { CodeMaker } from "codemaker";
import { APITYPE, DATABASE, LAMBDASTYLE } from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { DynamoDB } from "../../../constructs/Dynamodb";


export const importHandlerForStack=(database:string,apiType:string,code:CodeMaker)=>{
  const cdk = new Cdk(code);
  const imp = new Imports(code);
  imp.importsForStack();
  imp.importApiManager();
  if (apiType === APITYPE.graphql){
    imp.importForAppsyncConstruct();
  } else {
    imp.importForApiGatewayConstruct();
  }
  imp.importForLambdaConstruct();
  databaseImportHandler(database,code)
}

export const databaseImportHandler = (database:string,code:CodeMaker) =>{
  const imp = new Imports(code)
  if (database === DATABASE.dynamo) {
    imp.importForDynamodbConstruct();
  }
  if (database === DATABASE.neptune) {
    imp.importForNeptuneConstruct();
  }
  if (database === DATABASE.aurora) {
    imp.importForAuroraDbConstruct();
  }
}

export const LambdaAccessHandler = (
  code: CodeMaker,
  apiName: string,
  lambdaStyle: LAMBDASTYLE,
  apiType:string,
  mutationsAndQueries: any
) => {
  const dynamodb = new DynamoDB(code);
  if (lambdaStyle === LAMBDASTYLE.single || apiType === APITYPE.rest){
    dynamodb.dbConstructLambdaAccess(apiName,`${apiName}_table`, `${apiName}Lambda`, lambdaStyle, apiType );
    code.line()
  } else if (lambdaStyle === LAMBDASTYLE.multi && apiType === APITYPE.graphql) {
    Object.keys(mutationsAndQueries).forEach((key) => {
      dynamodb.dbConstructLambdaAccess( apiName, `${apiName}_table`,`${apiName}Lambda`, lambdaStyle,apiType,key);
    });
    code.line()
  }
};

export const propsHandlerForApiGatewayConstruct = (
  code: CodeMaker,
  apiName: string
) => {
  let lambdafunc = `${apiName}_lambdaFn`;
  code.line(`${lambdafunc}: ${apiName}Lambda.${lambdafunc}`);
};

