import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import { CONSTRUCTS, ApiModel } from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { Neptune } from "../../../constructs/Neptune";
import { Iam } from "../../../constructs/Iam";
import { isolatedFunction, subnetFunction } from "./functions";

type StackBuilderProps = {
  config: ApiModel;
};

export class NeptuneDBConstructTest {
  outputFile: string = `${CONSTRUCTS.neptuneDB}.test.ts`;
  outputDir: string = `test`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcNeptuneDBConstructTestFile() {
    this.code.openFile(this.outputFile);

    const { apiName } = this.config.api;
    const cdk = new Cdk(this.code);
    const neptune = new Neptune(this.code);
    const imp = new Imports(this.code);
    const iam = new Iam(this.code);

    imp.ImportsForTest();
    imp.importForNeptuneConstructInTest();
    this.code.line();

    cdk.initializeTest("Neptune Constructs Test", () => {
      iam.constructorIdentifier(CONSTRUCTS.neptuneDB);
      this.code.line(`const constructs = ${CONSTRUCTS.neptuneDB}_stack.node.children;`);
      this.code.line(`expect(constructs).toHaveLength(5);`);
      this.code.line();
      isolatedFunction(this.code);
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
      subnetFunction(this.code);
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
      neptune.initializeTestForCountResources("AWS::EC2::SubnetRouteTableAssociation",2);
      neptune.initializeTestForCountResources("AWS::EC2::SecurityGroup", 1);
      neptune.initializeTestForCountResources("AWS::EC2::SecurityGroupIngress", 1 );
      neptune.initializeTestForCountResources("AWS::Neptune::DBCluster", 1);
      neptune.initializeTestForCountResources("AWS::Neptune::DBInstance", 1);
    });
    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const neptuneDBConstructTest = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new NeptuneDBConstructTest(props);
  await builder.construcNeptuneDBConstructTestFile();
};
