import { aws_iam as iam } from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { aws_rds as rds } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";
interface ArouraProps {
  prod?: string;
}

export class AuroraDBConstruct extends Construct {
  public CLUSTER_ARN: string;
  public SECRET_ARN: string;
  public DB_NAME: string;
  public vpcRef: ec2.Vpc;
  public serviceRole: iam.Role;
  public db_cluster: rds.ServerlessCluster;

  constructor(scope: Construct, id: string, props?: ArouraProps) {
    super(scope, id);

    const myTodoApi_vpc = new ec2.Vpc(this, "myTodoApiVpc");
    const myTodoApi_db = new rds.ServerlessCluster(
      this,
      props?.prod ? props.prod + "myTodoApiDB" : "myTodoApiDB",
      {
        vpc: myTodoApi_vpc,
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_10_14,
        }),
        scaling: {
          autoPause: Duration.minutes(10),
          minCapacity: rds.AuroraCapacityUnit.ACU_8,
          maxCapacity: rds.AuroraCapacityUnit.ACU_32,
        },
        deletionProtection: false,
        defaultDatabaseName: props?.prod
          ? props?.prod + "myTodoApiDB"
          : "myTodoApiDB",
      }
    );
    const myTodoApiLambda_serviceRole: iam.Role = new iam.Role(
      this,
      "lambdaServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSDataFullAccess"),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaVPCAccessExecutionRole"
          ),
        ],
      }
    );
    const myTodoApi_secret = myTodoApi_db.secret?.secretArn || "secret";
    myTodoApi_db.connections.allowFromAnyIpv4(ec2.Port.tcp(3306));
    this.serviceRole = myTodoApiLambda_serviceRole;
    this.vpcRef = myTodoApi_vpc;
    this.SECRET_ARN = myTodoApi_secret;
    this.CLUSTER_ARN = myTodoApi_db.clusterArn;
    this.DB_NAME = props?.prod ? props?.prod + "myTodoApiDB" : "myTodoApiDB";
    this.db_cluster = myTodoApi_db;
  }
}
