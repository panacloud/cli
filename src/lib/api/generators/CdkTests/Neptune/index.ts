import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import { CONSTRUCTS, Config } from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { Neptune } from "../../../constructs/Neptune";
import { Iam } from "../../../constructs/Iam";
import { isolatedFunction, subnetFunction } from "./functions";

type StackBuilderProps = {
  config: Config;
};

export class NeptuneDBConstructTest {
  outputFile: string = `${CONSTRUCTS.neptuneDb}.test.ts`;
  outputDir: string = `test`;
  config: Config;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcNeptuneDBConstructTestFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName } = this.config.api;
    const cdk = new Cdk();
    const neptune = new Neptune();
    const imp = new Imports();
    const iam = new Iam();

    imp.ImportsForTest(this.outputDir, "pattern_v2");
    imp.importForNeptuneConstructInTest();
    imp.importForLambdaConstructInTest();
    this.code.line();

    cdk.initializeTest(
      "Neptune Construct Tests",
      () => {
        this.code.line();
        iam.constructorIdentifier(CONSTRUCTS.neptuneDb);
        this.code.line(
          `const constructs = VpcNeptuneConstruct_stack.node.children;`
        );
        this.code.line(`expect(constructs).toHaveLength(5);`);
        this.code.line();
        isolatedFunction();
        this.code.line();
        neptune.initializeTesForEC2Vpc();
        this.code.line();
        neptune.initializeTestForSubnet(apiName, 0, "1", "0");
        this.code.line();
        neptune.initializeTestForSubnet(apiName, 1, "2", "1");
        this.code.line();
        neptune.initiaizeTestForRouteTable(apiName, "1");
        this.code.line();
        neptune.initiaizeTestForRouteTable(apiName, "2");
        neptune.initializeTestForSubnetRouteTableAssociation(1);
        this.code.line();
        neptune.initializeTestForSubnetRouteTableAssociation(2);
        this.code.line();
        neptune.initializeTestForSecurityGroup(apiName);
        this.code.line();
        neptune.initializeTestForSecurityGroupIngress(apiName);
        subnetFunction();
        this.code.line();
        neptune.initializeTestForDBSubnetGroup(apiName);
        this.code.line();
        neptune.initializeTestForDBCluster(apiName);
        this.code.line();
        neptune.initializeTestForDBInstance(apiName);
        this.code.line();
        neptune.initializeTestForCountResources("AWS::EC2::VPC", 1);
        neptune.initializeTestForCountResources("AWS::EC2::Subnet", 2);
        neptune.initializeTestForCountResources("AWS::EC2::RouteTable", 2);
        neptune.initializeTestForCountResources(
          "AWS::EC2::SubnetRouteTableAssociation",
          2
        );
        neptune.initializeTestForCountResources("AWS::EC2::SecurityGroup", 1);
        neptune.initializeTestForCountResources(
          "AWS::EC2::SecurityGroupIngress",
          1
        );
        neptune.initializeTestForCountResources("AWS::Neptune::DBCluster", 1);
        neptune.initializeTestForCountResources("AWS::Neptune::DBInstance", 1);
      },
      this.outputDir,
      "pattern_v2"
    );
  }
}

export const neptuneDBConstructTest = async (
    props: StackBuilderProps
  ): Promise<void> => {
    const builder = new NeptuneDBConstructTest(props);
    await builder.construcNeptuneDBConstructTestFile();
  };
