import { CodeMaker } from "codemaker";
import { TypeScriptWriter, Property } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, ApiModel } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { Ec2 } from "../../constructs/Ec2";
import { Neptune } from "../../constructs/Neptune";
import { neptunePropertiesInitializer } from "./functions";

type StackBuilderProps = {
  config: ApiModel;
};

export class NeptuneDBConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.neptuneDB}`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcNeptuneDBConstructFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName } = this.config.api;
    const cdk = new Cdk(this.code);
    const ec2 = new Ec2(this.code);
    const neptune = new Neptune(this.code);
    const imp = new Imports(this.code);

    ts.writeImports("aws-cdk-lib", ["Tags"]);
    imp.importNeptune();
    imp.importEc2();

    const propertiesForNeptuneDbConstruct: Property[] = [
      {
        name: "VPCRef",
        typeName: "ec2.Vpc",
        accessModifier: "public",
        isReadonly: false,
      },
      {
        name: "SGRef",
        typeName: "ec2.SecurityGroup",
        accessModifier: "public",
        isReadonly: false,
      },
      {
        name: "neptuneReaderEndpoint",
        typeName: "string",
        accessModifier: "public",
        isReadonly: false,
      },
    ];

    cdk.initializeConstruct(
      CONSTRUCTS.neptuneDB,
      undefined,
      () => {
        ec2.initializeVpc(
          apiName,
          `
                    {
                      cidrMask: 24, 
                      name: 'Ingress',
                      subnetType: ec2.SubnetType.ISOLATED,
                    }`
        );

        ec2.initializeSecurityGroup(apiName, `${apiName}_vpc`);
        this.code.line();

        cdk.tagAdd(`${apiName}_sg`, "Name", `${apiName}SecurityGroup`);
        this.code.line();

        cdk.nodeAddDependency(`${apiName}_sg`, `${apiName}_vpc`);
        this.code.line();

        ec2.securityGroupAddIngressRule(apiName, `${apiName}_sg`);
        this.code.line();

        neptune.initializeNeptuneSubnet(apiName, `${apiName}_vpc`);
        this.code.line();

        cdk.nodeAddDependency(`${apiName}_neptuneSubnet`, `${apiName}_vpc`);
        cdk.nodeAddDependency(`${apiName}_neptuneSubnet`, `${apiName}_sg`);

        neptune.initializeNeptuneCluster(
          apiName,
          `${apiName}_neptuneSubnet`,
          `${apiName}_sg`
        );
        this.code.line();

        neptune.addDependsOn(
          `${apiName}_neptuneSubnet`,
          `${apiName}_neptuneCluster`
        );
        this.code.line();

        cdk.nodeAddDependency(`${apiName}_neptuneCluster`, `${apiName}_vpc`);
        this.code.line();

        neptune.initializeNeptuneInstance(
          apiName,
          `${apiName}_vpc`,
          `${apiName}_neptuneCluster`
        );
        this.code.line();

        neptune.addDependsOn(
          `${apiName}_neptuneCluster`,
          `${apiName}_neptuneInstance`
        );
        this.code.line();

        cdk.nodeAddDependency(`${apiName}_neptuneInstance`, `${apiName}_vpc`);
        cdk.nodeAddDependency(
          `${apiName}_neptuneInstance`,
          `${apiName}_neptuneSubnet`
        );
        this.code.line();

        neptunePropertiesInitializer(apiName, this.code);
      },
      undefined,
      propertiesForNeptuneDbConstruct
    );
    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const neptuneDBConstruct = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new NeptuneDBConstruct(props);
  await builder.construcNeptuneDBConstructFile();
};
