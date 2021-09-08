import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import { CONSTRUCTS, Config } from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { AuroraServerless } from "../../../constructs/AuroraServerless";
import { Iam } from "../../../constructs/Iam";
import { subnetAuroraFunction } from "./functions";

type StackBuilderProps = {
  config: Config;
};

export class AuroraServerlessDBConstructTest {
  outputFile: string = `${CONSTRUCTS.auroradb}.test.ts`;
  outputDir: string = `test`;
  config: Config;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async constructAuroraDBConstructTestFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);

    const { apiName } = this.config.api;
    const cdk = new Cdk(this.code);
    const auroradb = new AuroraServerless(this.code);
    const imp = new Imports(this.code);
    const iam = new Iam(this.code);
    imp.ImportsForTest()
    imp.importForAuroraDbConstructInTest();
    this.code.line();
    cdk.initializeTest(
      "Auroradb Constructs Test",
      () => {
        this.code.line();
        iam.constructorIdentifier(CONSTRUCTS.auroradb);
        this.code.line(
          `const public_subnets = AuroraDbConstruct_stack.vpcRef.publicSubnets;`
        );
        auroradb.route_tableIdentifier("public");
        this.code.line();
        this.code.line(
          `const private_subnets = AuroraDbConstruct_stack.vpcRef.privateSubnets;`
        );
        auroradb.route_tableIdentifier("private");
        this.code.line();
        iam.natgatewayIdentifier("1", 0);
        this.code.line();
        iam.natgatewayIdentifier("2", 1);
        this.code.line();
        iam.internetGatewayIdentifier();
        this.code.line();
        iam.eipIdentifier("1", 0);
        this.code.line();
        iam.eipIdentifier("2", 1);
        this.code.line();
        auroradb.initializeTestForEC2Vpc();
        this.code.line();
        auroradb.initializeTestForSubnet(apiName, "10.0.0.0/18", 0, true, "Public", "1");
        this.code.line();
        auroradb.initializeTestForSubnet(apiName, "10.0.64.0/18", 1, true, "Public", "2");
        this.code.line();
        auroradb.initializeTestForSubnet(apiName, "10.0.128.0/18", 0, false, "Private", "1");
        this.code.line();
        auroradb.initializeTestForSubnet(apiName,"10.0.192.0/18",1,false,"Private","2");
        this.code.line();
        auroradb.initializeTestForRouteTable(apiName, "Public", "1");
        this.code.line();
        auroradb.initializeTestForRouteTable(apiName, "Public", "2");
        this.code.line();
        auroradb.initializeTestForRouteTable(apiName, "Private", "1");
        this.code.line();
        auroradb.initializeTestForRouteTable(apiName, "Private", "2");
        this.code.line();
        auroradb.initializeTestForSubnetRouteTableAssociation(
          "publicRouteTables",
          0,
          "routeTableId",
          "",
          "public_subnets",
          0
        );
        this.code.line();
        auroradb.initializeTestForSubnetRouteTableAssociation("publicRouteTables",
          1,
          "routeTableId",
          ""
          ,"public_subnets",
          1
        );
        this.code.line();
        auroradb.initializeTestForSubnetRouteTableAssociation("private_subnets",0,"routeTable",".routeTableId","private_subnets",0);
        this.code.line();
        auroradb.initializeTestForSubnetRouteTableAssociation(
          "private_subnets",
          1,
          "routeTable",
          ".routeTableId",
          "private_subnets",
          1
        );
        this.code.line();
        auroradb.initializeTestForSecurityGroup();
        this.code.line();
        auroradb.initializeTestForRoute(
          "privateRouteTables",
          0,
          "NatGatewayId",
          "natGateway1"
        );
        this.code.line();
        auroradb.initializeTestForRoute(
          "privateRouteTables",
          1,
          "NatGatewayId",
          "natGateway2"
        );
        this.code.line();
        auroradb.initializeTestForRoute(
          "publicRouteTables",
          0,
          "GatewayId",
          "internetGateway"
        );
        this.code.line();
        auroradb.initializeTestForRoute(
          "publicRouteTables",
          1,
          "GatewayId",
          "internetGateway"
        );
        this.code.line();
        auroradb.initializeTestForEIP(apiName, "1");
        this.code.line();
        auroradb.initializeTestForEIP(apiName, "2");
        this.code.line();
        auroradb.initializeTestForNatGateway(apiName, 0, "1", "1");
        this.code.line();
        auroradb.initializeTestForNatGateway(apiName, 1, "2", "2");
        this.code.line();
        subnetAuroraFunction(this.code);
        this.code.line();
        auroradb.initializeTestForDBSubnetGroup(apiName);
        this.code.line();
        auroradb.ininitializeTestForRole();
        this.code.line();
        auroradb.initializeTestForCountResources("AWS::EC2::VPC", 1);
        auroradb.initializeTestForCountResources("AWS::EC2::Subnet", 4);
        auroradb.initializeTestForCountResources("AWS::EC2::RouteTable", 4);
        auroradb.initializeTestForCountResources(
          "AWS::EC2::SubnetRouteTableAssociation",
          4
        );
        auroradb.initializeTestForCountResources("AWS::EC2::Route", 4);
        auroradb.initializeTestForCountResources("AWS::EC2::SecurityGroup", 1);
        auroradb.initializeTestForCountResources("AWS::EC2::EIP", 2);
        auroradb.initializeTestForCountResources("AWS::EC2::NatGateway", 2);
        auroradb.initializeTestForCountResources("AWS::RDS::DBSubnetGroup", 1);
      },
    );
    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir); 
  }
}


export const auroraDBConstructTest = async (
    props: StackBuilderProps
  ): Promise<void> => {
    const builder = new AuroraServerlessDBConstructTest(props);
    await builder.constructAuroraDBConstructTestFile();
  };