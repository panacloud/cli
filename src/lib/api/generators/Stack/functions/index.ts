import { CodeMaker } from "codemaker";
import { APITYPE, DATABASE, LAMBDASTYLE } from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { DynamoDB } from "../../../constructs/DynamoDB";


export const importHandlerForStack=(database:string,apiType:string,code:CodeMaker)=>{
  const cdk = new Cdk(code);
  const imp = new Imports(code);
  imp.importsForStack();
  imp.importApiManager();
  if (apiType === APITYPE.graphql) {
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

export const lambdaEnvHandler = (
  code: CodeMaker,
  apiName: string,
  lambdaStyle: LAMBDASTYLE,
  mutationsAndQueries: any
) => {
  let apiLambda = apiName + "Lambda";
  if (lambdaStyle === LAMBDASTYLE.single) {
    let lambdafunc = `${apiName}_lambdaFn`;
    code.line(
      `${apiLambda}.${lambdafunc}.addEnvironment("TABLE_NAME",${apiName}_table.tableName)`
    );
    code.line();
  }
  if (lambdaStyle === LAMBDASTYLE.multi) {
    Object.keys(mutationsAndQueries).forEach((key) => {
      let lambdafunc = `${apiName}_lambdaFn_${key}`;
      code.line(
        `${apiLambda}.${lambdafunc}.addEnvironment("TABLE_NAME",${apiName}_table.tableName)`
      );
      code.line();
    });
  }
};

export const lambdaPropsHandlerDynamodb = (
  code: CodeMaker,
  dbConstructName: string
) => {
  code.line(`tableName:${dbConstructName}.table.tableName`);
  code.line();
};

export const lambdaConstructPropsHandlerNeptunedb = (
  code: CodeMaker,
  apiName: string
) => {
  code.line(`SGRef:${apiName}_neptunedb.SGRef,`);
  code.line(`VPCRef:${apiName}_neptunedb.VPCRef,`);
  code.line(
    `neptuneReaderEndpoint:${apiName}_neptunedb.neptuneReaderEndpoint`
  );
};

export const lambdaConstructPropsHandlerAuroradb = (
  code: CodeMaker,
  apiName: string
) => {
  code.line(`secretRef:${apiName}_auroradb.secretRef,`);
  code.line(`vpcRef:${apiName}_auroradb.vpcRef,`);
  code.line(`serviceRole: ${apiName}_auroradb.serviceRole`);
};

export const propsHandlerForAppsyncConstructDynamodb = (
  code: CodeMaker,
  apiName: string,
  lambdaStyle: LAMBDASTYLE,
  mutationsAndQueries: any
) => {
  if (lambdaStyle === LAMBDASTYLE.single) {
    let apiLambda = apiName + "Lambda";
    let lambdafunc = `${apiName}_lambdaFn`;
    code.line(`${lambdafunc}Arn : ${apiLambda}.${lambdafunc}.functionArn`);
  } else if (lambdaStyle === LAMBDASTYLE.multi) {
    Object.keys(mutationsAndQueries).forEach((key) => {
      let apiLambda = `${apiName}Lambda`;
      let lambdafunc = `${apiName}_lambdaFn_${key}`;
      code.line(
        `${lambdafunc}Arn : ${apiLambda}.${lambdafunc}.functionArn,`
      );
    });
  }
};

export const propsHandlerForAppsyncConstructNeptunedb = (
  code: CodeMaker,
  apiName: string,
  lambdaStyle: LAMBDASTYLE,
  mutationsAndQueries: any
) => {
  if (lambdaStyle === LAMBDASTYLE.single) {
    let apiLambda = apiName + "Lambda";
    let lambdafunc = `${apiName}_lambdaFnArn`;
    code.line(`${lambdafunc} : ${apiLambda}.${lambdafunc}`);
  } else if (lambdaStyle === LAMBDASTYLE.multi) {
    Object.keys(mutationsAndQueries).forEach((key) => {
      let apiLambda = `${apiName}Lambda`;
      let lambdafunc = `${apiName}_lambdaFn_${key}`;
      code.line(`${lambdafunc}Arn : ${apiLambda}.${lambdafunc}Arn,`);
    });
  }
};

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

export const propsHandlerForDynamoDbConstruct = (
  code: CodeMaker,
  apiName: string,
  lambdaStyle: LAMBDASTYLE,
  mutationsAndQueries: any
) => {
  if (lambdaStyle === LAMBDASTYLE.single) {
    let lambdafunc = `${apiName}_lambdaFn`;
    code.line(`${lambdafunc}: ${apiName}Lambda.${lambdafunc}`);
  } else if (lambdaStyle === LAMBDASTYLE.multi) {
    Object.keys(mutationsAndQueries).forEach((key, index) => {
      let lambdafunc = `${apiName}_lambdaFn_${key}`;
      code.line(`${lambdafunc} : ${apiName}Lambda.${lambdafunc},`);
    });
  }
};
