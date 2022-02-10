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

    const myTodoApi_vpc = new ec2.Vpc(this, "myTodoApiVpc", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Ingress",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
    const myTodoApi_sg = new ec2.SecurityGroup(this, "myTodoApiSecurityGroup", {
      vpc: myTodoApi_vpc,
      allowAllOutbound: true,
      description: "myTodoApi security group",
      securityGroupName: props?.prod
        ? props?.prod + "-myTodoApiSecurityGroup"
        : "myTodoApiSecurityGroup",
    });

    Tags.of(myTodoApi_sg).add("Name", "myTodoApiSecurityGroup");

    myTodoApi_sg.node.addDependency(myTodoApi_vpc);

    myTodoApi_sg.addIngressRule(
      myTodoApi_sg,
      ec2.Port.tcp(8182),
      "myTodoApiRule"
    );

    const myTodoApi_neptuneSubnet = new neptune.CfnDBSubnetGroup(
      this,
      "my todo api-neptune-subnet-group",
      {
        dbSubnetGroupDescription: "my todo api Subnet",
        subnetIds: myTodoApi_vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }).subnetIds,
        dbSubnetGroupName: props?.prod
          ? props?.prod + "-my todo api-neptune-subnet-group"
          : "my todo api-neptune-subnet-group",
      }
    );
    myTodoApi_neptuneSubnet.node.addDependency(myTodoApi_vpc);
    myTodoApi_neptuneSubnet.node.addDependency(myTodoApi_sg);
    const myTodoApi_neptuneCluster = new neptune.CfnDBCluster(
      this,
      "myTodoApiCluster",
      {
        dbSubnetGroupName: myTodoApi_neptuneSubnet.dbSubnetGroupName,
        dbClusterIdentifier: props?.prod
          ? props?.prod + "-myTodoApiCluster"
          : "myTodoApiCluster",
        vpcSecurityGroupIds: [myTodoApi_sg.securityGroupId],
      }
    );
    myTodoApi_neptuneCluster.addDependsOn(myTodoApi_neptuneSubnet);

    myTodoApi_neptuneCluster.node.addDependency(myTodoApi_vpc);

    const myTodoApi_neptuneInstance = new neptune.CfnDBInstance(
      this,
      "myTodoApiinstance",
      {
        dbInstanceClass: "db.t3.medium",
        dbClusterIdentifier: myTodoApi_neptuneCluster.dbClusterIdentifier,
        availabilityZone: myTodoApi_vpc.availabilityZones[0],
      }
    );
    myTodoApi_neptuneInstance.addDependsOn(myTodoApi_neptuneCluster);

    myTodoApi_neptuneInstance.node.addDependency(myTodoApi_vpc);
    myTodoApi_neptuneInstance.node.addDependency(myTodoApi_neptuneSubnet);

    this.VPCRef = myTodoApi_vpc;
    this.SGRef = myTodoApi_sg;
    this.neptuneReaderEndpoint = myTodoApi_neptuneCluster.attrReadEndpoint;
  }
}
