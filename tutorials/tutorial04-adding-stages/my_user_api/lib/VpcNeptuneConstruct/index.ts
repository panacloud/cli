import { Tags } from "aws-cdk-lib";
import { aws_neptune as neptune } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";
interface NeptuneProps {
  prod?: string;
}

export class VpcNeptuneConstruct extends Construct {
  public VPCRef: ec2.Vpc;
  public SGRef: ec2.SecurityGroup;
  public neptuneReaderEndpoint: string;

  constructor(scope: Construct, id: string, props?: NeptuneProps) {
    super(scope, id);

    const myUserApi_vpc = new ec2.Vpc(this, "myUserApiVpc", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Ingress",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
    const myUserApi_sg = new ec2.SecurityGroup(this, "myUserApiSecurityGroup", {
      vpc: myUserApi_vpc,
      allowAllOutbound: true,
      description: "myUserApi security group",
      securityGroupName: props?.prod
        ? props?.prod + "-myUserApiSecurityGroup"
        : "myUserApiSecurityGroup",
    });

    Tags.of(myUserApi_sg).add("Name", "myUserApiSecurityGroup");

    myUserApi_sg.node.addDependency(myUserApi_vpc);

    myUserApi_sg.addIngressRule(
      myUserApi_sg,
      ec2.Port.tcp(8182),
      "myUserApiRule"
    );

    const myUserApi_neptuneSubnet = new neptune.CfnDBSubnetGroup(
      this,
      "my user api-neptune-subnet-group",
      {
        dbSubnetGroupDescription: "my user api Subnet",
        subnetIds: myUserApi_vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }).subnetIds,
        dbSubnetGroupName: props?.prod
          ? props?.prod + "-my user api-neptune-subnet-group"
          : "my user api-neptune-subnet-group",
      }
    );
    myUserApi_neptuneSubnet.node.addDependency(myUserApi_vpc);
    myUserApi_neptuneSubnet.node.addDependency(myUserApi_sg);
    const myUserApi_neptuneCluster = new neptune.CfnDBCluster(
      this,
      "myUserApiCluster",
      {
        dbSubnetGroupName: myUserApi_neptuneSubnet.dbSubnetGroupName,
        dbClusterIdentifier: props?.prod
          ? props?.prod + "-myUserApiCluster"
          : "myUserApiCluster",
        vpcSecurityGroupIds: [myUserApi_sg.securityGroupId],
      }
    );
    myUserApi_neptuneCluster.addDependsOn(myUserApi_neptuneSubnet);

    myUserApi_neptuneCluster.node.addDependency(myUserApi_vpc);

    const myUserApi_neptuneInstance = new neptune.CfnDBInstance(
      this,
      "myUserApiinstance",
      {
        dbInstanceClass: "db.t3.medium",
        dbClusterIdentifier: myUserApi_neptuneCluster.dbClusterIdentifier,
        availabilityZone: myUserApi_vpc.availabilityZones[0],
      }
    );
    myUserApi_neptuneInstance.addDependsOn(myUserApi_neptuneCluster);

    myUserApi_neptuneInstance.node.addDependency(myUserApi_vpc);
    myUserApi_neptuneInstance.node.addDependency(myUserApi_neptuneSubnet);

    this.VPCRef = myUserApi_vpc;
    this.SGRef = myUserApi_sg;
    this.neptuneReaderEndpoint = myUserApi_neptuneCluster.attrReadEndpoint;
  }
}
