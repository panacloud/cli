import { CodeMaker } from "codemaker";
import { TypeScriptWriter, Property } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, ApiModel } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { Ec2 } from "../../constructs/Ec2";
import { Rds } from "../../constructs/Rds";
import { Iam } from "../../constructs/Iam";

type StackBuilderProps = {
  config: ApiModel;
};

interface ConstructPropsType {
  name: string;
  type: string;
}

export class RdsConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.rds}`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcRdsConstructFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName } = this.config.api;
    const cdk = new Cdk(this.code);
    const ec2 = new Ec2(this.code);
    const rds = new Rds(this.code);
    const imp = new Imports(this.code);
    const iam = new Iam(this.code);

    imp.importEc2();
    imp.importRds();
    imp.importIam();

    let ConstructProps: ConstructPropsType[] = [];

    ConstructProps.push({
      name: `prod?`,
      type: "string",
    });

    const propertiesForRdsConstruct: Property[] = [
      {
        name: "serviceRole",
        typeName: "iam.Role",
        accessModifier: "public",
        isReadonly: false,
      },
      {
        name: "VPCRef",
        typeName: "ec2.Vpc",
        accessModifier: "public",
        isReadonly: false,
      },
      {
        name: "SECRET_ARN",
        typeName: "string",
        accessModifier: "public",
        isReadonly: false,
      },
      {
        name: "db_instance",
        typeName: "rds.DatabaseInstance",
        accessModifier: "public",
        isReadonly: false,
      },
    ];

    cdk.initializeConstruct(
      CONSTRUCTS.rds,
      "NeptuneProps",
      () => {
        ec2.initializeVpc(apiName);
        this.code.line();

        iam.serviceRoleForLambda(apiName, [
          "AmazonRDSDataFullAccess",
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ]);
        this.code.line();

        rds.initializeRdsInstance(apiName);
        this.code.line();

        this.code.line(
          `${apiName}_rdsInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(3306));`
        );
        this.code.line();

        this.code.line(`this.serviceRole = ${apiName}Lambda_serviceRole;`);
        this.code.line(`this.VPCRef = ${apiName}_vpc;`);
        this.code.line(`this.db_instance = ${apiName}_rdsInstance;`);
        this.code.line(
          `this.SECRET_ARN = ${apiName}_rdsInstance.secret?.secretArn || "dbcreds"`
        );
      },
      ConstructProps,
      propertiesForRdsConstruct
    );
    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const rdsConstruct = async (props: StackBuilderProps): Promise<void> => {
  const builder = new RdsConstruct(props);
  await builder.construcRdsConstructFile();
};
