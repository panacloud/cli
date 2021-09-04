import { CodeMaker } from "codemaker";
import { TypeScriptWriter, Property } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, Config } from "../../../../utils/constants";
import { AuroraServerless } from "../../constructs/AuroraServerless";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { Ec2 } from "../../constructs/Ec2";
import { Iam } from "../../constructs/Iam";
import {
  auroradbPropertiesHandler,
  auroradbPropertiesInitializer,
} from "./functions";

type StackBuilderProps = {
  config: Config;
};

export class AuroraDBConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.auroradb}`;
  config: Config;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcAuroraDBConstructFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName } = this.config.api;
    const cdk = new Cdk();
    const ec2 = new Ec2();
    const aurora = new AuroraServerless();
    const iam = new Iam();
    const imp = new Imports();

    imp.importsForStack();
    imp.importIam();
    ts.writeImports("aws-cdk-lib", ["Duration"]);
    imp.importRds();
    imp.importEc2();
    this.code.line();

    const auroradbProperties: Property[] = auroradbPropertiesHandler();

    cdk.initializeConstruct(
      CONSTRUCTS.auroradb,
      undefined,
      () => {
        ec2.initializeVpc(apiName);
        this.code.line;

        aurora.initializeAuroraCluster(apiName, `${apiName}_vpc`);
        this.code.line;

        iam.serviceRoleForLambda(apiName, [
          "AmazonRDSDataFullAccess",
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ]);
        this.code.line;

        ts.writeVariableDeclaration(
          {
            name: `${apiName}_secret`,
            typeName: "",
            initializer: () => {
              this.code.line(`${apiName}_db.secret?.secretArn || "secret"`);
            },
          },
          "const"
        );
        this.code.line;

        aurora.connectionsAllowFromAnyIpv4(`${apiName}_db`);
        this.code.line;

        auroradbPropertiesInitializer(apiName);
      },
      undefined,
      auroradbProperties
    );

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const auroraDBConstruct = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new AuroraDBConstruct(props);
  await builder.construcAuroraDBConstructFile();
};
