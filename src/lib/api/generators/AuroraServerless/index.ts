import { CodeMaker } from "codemaker";
import { TypeScriptWriter, Property } from "../../../../utils/typescriptWriter";
import { CONSTRUCTS, ApiModel } from "../../../../utils/constants";
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
  config: ApiModel;
};

interface ConstructPropsType {
  name: string;
  type: string;
}

export class AuroraDBConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.auroraDB}`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcAuroraDBConstructFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName ,rdbmsEngine} = this.config.api;
    const cdk = new Cdk(this.code);
    const ec2 = new Ec2(this.code);
    const aurora = new AuroraServerless(this.code);
    const iam = new Iam(this.code);
    const imp = new Imports(this.code);

    imp.importIam();
    imp.importCdkDuration();
    imp.importRds();
    imp.importEc2();

    let ConstructProps: ConstructPropsType[] = [];

    ConstructProps.push({
      name: `prod?`,
      type: "string",
    })


    const auroradbProperties: Property[] = auroradbPropertiesHandler();

    cdk.initializeConstruct(
      CONSTRUCTS.auroraDB,
      "ArouraProps",
      () => {
        ec2.initializeVpc(apiName);
        this.code.line();
        rdbmsEngine&&aurora.initializeAuroraCluster(apiName, `${apiName}_vpc`,rdbmsEngine);
        this.code.line();
        iam.serviceRoleForLambda(apiName, [
          "AmazonRDSDataFullAccess",
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ]);
        this.code.line();

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

        auroradbPropertiesInitializer(apiName, this.code);
      },
      ConstructProps,
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
