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

    const myApi_vpc = new ec2.Vpc(this, "myApiVpc", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Ingress",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
    const myApi_sg = new ec2.SecurityGroup(this, "myApiSecurityGroup", {
      vpc: myApi_vpc,
      allowAllOutbound: true,
      description: "myApi security group",
      securityGroupName: props?.prod
        ? props?.prod + "-myApiSecurityGroup"
        : "myApiSecurityGroup",
    });

    Tags.of(myApi_sg).add("Name", "myApiSecurityGroup");

    myApi_sg.node.addDependency(myApi_vpc);

    myApi_sg.addIngressRule(myApi_sg, ec2.Port.tcp(8182), "myApiRule");

    const myApi_neptuneSubnet = new neptune.CfnDBSubnetGroup(
      this,
      "my api-neptune-subnet-group",
      {
        dbSubnetGroupDescription: "my api Subnet",
        subnetIds: myApi_vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }).subnetIds,
        dbSubnetGroupName: props?.prod
          ? props?.prod + "-my api-neptune-subnet-group"
          : "my api-neptune-subnet-group",
      }
    );
    myApi_neptuneSubnet.node.addDependency(myApi_vpc);
    myApi_neptuneSubnet.node.addDependency(myApi_sg);
    const myApi_neptuneCluster = new neptune.CfnDBCluster(
      this,
      "myApiCluster",
      {
        dbSubnetGroupName: myApi_neptuneSubnet.dbSubnetGroupName,
        dbClusterIdentifier: props?.prod
          ? props?.prod + "-myApiCluster"
          : "myApiCluster",
        vpcSecurityGroupIds: [myApi_sg.securityGroupId],
      }
    );
    myApi_neptuneCluster.addDependsOn(myApi_neptuneSubnet);

    myApi_neptuneCluster.node.addDependency(myApi_vpc);

    const myApi_neptuneInstance = new neptune.CfnDBInstance(
      this,
      "myApiinstance",
      {
        dbInstanceClass: "db.t3.medium",
        dbClusterIdentifier: myApi_neptuneCluster.dbClusterIdentifier,
        availabilityZone: myApi_vpc.availabilityZones[0],
      }
    );
    myApi_neptuneInstance.addDependsOn(myApi_neptuneCluster);

    myApi_neptuneInstance.node.addDependency(myApi_vpc);
    myApi_neptuneInstance.node.addDependency(myApi_neptuneSubnet);

    this.VPCRef = myApi_vpc;
    this.SGRef = myApi_sg;
    this.neptuneReaderEndpoint = myApi_neptuneCluster.attrReadEndpoint;
  }
}
