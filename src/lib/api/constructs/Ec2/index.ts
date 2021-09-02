import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
let maker = new CodeMaker()
export class Ec2 extends CodeMaker {

  public initializeVpc(
    apiName: string,
    subnetConfig?: string
  ) {
    const ts = new TypeScriptWriter();
    const config = subnetConfig
      ? `, {subnetConfiguration: [
      ${subnetConfig}
    ] }`
      : " ";
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_vpc`,
        typeName: "",
        initializer: () => {
          this.line(` new ec2.Vpc(this, "${apiName}Vpc" ${config} );`);
        },
      },
      "const",
       maker
    );
  }

  public initializeSecurityGroup(
    apiName: string,
    vpcName: string,
  ) {
    const ts = new TypeScriptWriter();
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_sg`,
        typeName: "",
        initializer: () => {
          this.line(`new ec2.SecurityGroup(this, "${apiName}SecurityGroup", {
            vpc: ${vpcName},
            allowAllOutbound: true,
            description: "${apiName} security group",
            securityGroupName: "${apiName}SecurityGroup",
          });
          `);
        },
      },
      "const",
      maker
    );
  }

  public securityGroupAddIngressRule(
    apiName: string,
    securityGroupName: string
  ) {
    this.line(
      `${securityGroupName}.addIngressRule(${securityGroupName}, ec2.Port.tcp(8182), "${apiName}Rule");`
    );
  }
}
