import { CodeMaker } from "codemaker";
import { CONSTRUCTS, APITYPE } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
const lowerCase = require("lodash/lowerCase");

export class Rds {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public initializeRdsInstance(apiName: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_rdsInstance`,
        typeName: "",
        initializer: () => {
          this.code
            .line(` new rds.DatabaseInstance(this, "${apiName}Instance", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.SMALL
      ),
      vpc: ${apiName}_vpc,
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_5_7,
      }),
      publiclyAccessible: true,
      multiAz: false,
      allocatedStorage: 100,
      storageType: rds.StorageType.STANDARD,
      cloudwatchLogsExports: ["audit", "error", "general"],
      databaseName: props?.prod ? props?.prod+"-${apiName}DB" : "${apiName}DB",
      deletionProtection: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });`);
        },
      },
      "const"
    );
  }

  public rdsConstructInitializer(apiName: string, code: CodeMaker) {
    const ts = new TypeScriptWriter(code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_rds`,
        typeName: CONSTRUCTS.rds,
        initializer: () => {
          this.code.line(
            `new ${CONSTRUCTS.rds}(this,"${apiName}${CONSTRUCTS.rds}", {prod : props?.prod})`
          );
        },
      },
      "const"
    );
  }

  public dbConstructLambdaAccess(
    apiName: string,
    dbConstructName: string,
    apiType: string,
    functionName?: string
  ) {
    if (apiType === APITYPE.rest) {
      this.code.line(`${dbConstructName}.grantConnect(${apiName}_lambdaFn);`);
    } else {
      this.code.line(
        `${dbConstructName}.grantConnect(${apiName}_lambdaFn_${functionName});`
      );
    }
  }
}
