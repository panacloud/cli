import { CodeMaker } from "codemaker";
import { CONSTRUCTS } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class Neptune {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public initializeNeptuneCluster(
    apiName: string,
    neptuneSubnetName: string,
    securityGroupName: string
  ) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_neptuneCluster`,
        typeName: "",
        initializer: () => {
          this.code.line(` new neptune.CfnDBCluster(this, "${apiName}Cluster", {
            dbSubnetGroupName: ${neptuneSubnetName}.dbSubnetGroupName,
            dbClusterIdentifier: "${apiName}Cluster",
            vpcSecurityGroupIds: [${securityGroupName}.securityGroupId],
          });`);
        },
      },
      "const"
    );
  }

  public neptunedbConstructInitializer(apiName: string, code: CodeMaker) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_neptunedb`,
        typeName: CONSTRUCTS.neptuneDB,
        initializer: () => {
          this.code.line(
            `new ${CONSTRUCTS.neptuneDB}(this,"${apiName}${CONSTRUCTS.neptuneDB}")`
          );
        },
      },
      "const"
    );
  }

  public initializeNeptuneSubnet(apiName: string, vpcName: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_neptuneSubnet`,
        typeName: "",
        initializer: () => {
          this.code.line(` new neptune.CfnDBSubnetGroup(
            this,
            "${apiName}neptuneSubnetGroup",
            {
              dbSubnetGroupDescription: "${apiName} Subnet",
              subnetIds: ${vpcName}.selectSubnets({ subnetType: ec2.SubnetType.ISOLATED })
                .subnetIds,
              dbSubnetGroupName: "${apiName}_subnetgroup",
            }
          );`);
        },
      },
      "const"
    );
  }

  public initializeNeptuneInstance(
    apiName: string,
    vpcName: string,
    neptuneClusterName: string
  ) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: `${apiName}_neptuneInstance`,
        typeName: "",
        initializer: () => {
          this.code
            .line(`new neptune.CfnDBInstance(this, "${apiName}instance", {
            dbInstanceClass: "db.t3.medium",
            dbClusterIdentifier: ${neptuneClusterName}.dbClusterIdentifier,
            availabilityZone: ${vpcName}.availabilityZones[0],
          });`);
        },
      },
      "const"
    );
  }

  public addDependsOn(sourceName: string, depended: string) {
    this.code.line(`${depended}.addDependsOn(${sourceName})`);
  }

  public initializeTesForEC2Vpc() {
    this.code.line(
      `expect(stack).toHaveResource('AWS::EC2::VPC', {
        CidrBlock: '10.0.0.0/16',
        EnableDnsHostnames: true,
        EnableDnsSupport: true,
        InstanceTenancy: 'default',
      })`
    );
  }

  public initializeTestForSubnet(
    apiName: string,
    fnNum: number,
    subnetNum: string,
    cidr: string
  ) {
    this.code.line(`expect(stack).toHaveResource('AWS::EC2::Subnet', {
      CidrBlock: '10.0.${cidr}.0/24',
      VpcId: {
        Ref: stack.getLogicalId(VpcNeptuneConstruct_stack.VPCRef.node.defaultChild as cdk.CfnElement),
      },
      AvailabilityZone: {
        'Fn::Select': [
          ${fnNum},
          {
            'Fn::GetAZs': '',
          },
        ],
      },
      MapPublicIpOnLaunch: false,
      Tags: [
        {
          Key: 'aws-cdk:subnet-name',
          Value: 'Ingress',
        },
        {
          Key: 'aws-cdk:subnet-type',
          Value: 'Isolated',
        },
        {
          Key: 'Name',
          Value: 'Default/VpcNeptuneConstructTest/${apiName}Vpc/IngressSubnet${subnetNum}',
        },
      ],
    });`);
  }

  public initiaizeTestForRouteTable(apiName: string, subnetNum: string) {
    this.code.line(`expect(stack).toHaveResource('AWS::EC2::RouteTable', {
      VpcId: {
        Ref: stack.getLogicalId(VpcNeptuneConstruct_stack.VPCRef.node.defaultChild as cdk.CfnElement),
      },
      Tags: [
        {
          Key: 'Name',
          Value: 'Default/VpcNeptuneConstructTest/${apiName}Vpc/IngressSubnet${subnetNum}',
        },
      ],
    });`);
  }

  public initializeTestForSubnetRouteTableAssociation(
    isolatedRouteTablesNum: number
  ) {
    this.code
      .line(`expect(stack).toHaveResource('AWS::EC2::SubnetRouteTableAssociation', {
      RouteTableId: stack.resolve(isolatedRouteTables[0].routeTableId),
      SubnetId: {
        Ref: stack.getLogicalId(
          isolated_subnets[0].node.defaultChild as cdk.CfnElement
        ),
      },
    });`);
  }

  public initializeTestForSecurityGroup(apiName: string) {
    this.code.line(`expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
    GroupDescription: '${apiName} security group',
    GroupName: '${apiName}SecurityGroup',
    SecurityGroupEgress: [
      {
        CidrIp: '0.0.0.0/0',
        Description: 'Allow all outbound traffic by default',
        IpProtocol: '-1',
      },
    ],
    Tags: [
      {
        Key: 'Name',
        Value: '${apiName}SecurityGroup',
      },
    ],
    VpcId: {
      "Ref":  stack.getLogicalId(VpcNeptuneConstruct_stack.VPCRef.node.defaultChild as cdk.CfnElement)
    },
  });
`);
  }

  public initializeTestForSecurityGroupIngress(apiName: string) {
    this.code
      .line(`expect(stack).toHaveResource('AWS::EC2::SecurityGroupIngress', {
    IpProtocol: 'tcp',
    Description: '${apiName}Rule',
    FromPort: 8182,
    GroupId: {
      'Fn::GetAtt': [
        stack.getLogicalId(VpcNeptuneConstruct_stack.SGRef.node.defaultChild as cdk.CfnElement),
        'GroupId',
      ],
    },
    SourceSecurityGroupId: {
      'Fn::GetAtt': [
        stack.getLogicalId(VpcNeptuneConstruct_stack.SGRef.node.defaultChild as cdk.CfnElement),
        'GroupId',
      ],
    },
    ToPort: 8182,
  });`);
  }

  public initializeTestForDBSubnetGroup(apiName: string) {
    this.code
      .line(`  expect(stack).toHaveResource('AWS::Neptune::DBSubnetGroup', {
      DBSubnetGroupDescription: '${apiName} Subnet',
      SubnetIds: subnetRefArray,
      DBSubnetGroupName: '${apiName}_subnetgroup',
    });`);
  }

  public initializeTestForDBCluster(apiName: string) {
    this.code.line(`expect(stack).toHaveResource('AWS::Neptune::DBCluster', {
      DBClusterIdentifier: '${apiName}Cluster',
      DBSubnetGroupName: '${apiName}_subnetgroup',
      VpcSecurityGroupIds: [
        {
          'Fn::GetAtt': [
            stack.getLogicalId(VpcNeptuneConstruct_stack.SGRef.node.defaultChild as cdk.CfnElement),
            'GroupId',
          ],
        },
      ],
    });`);
  }

  public initializeTestForDBInstance(apiName: string) {
    this.code.line(`expect(stack).toHaveResource('AWS::Neptune::DBInstance', {
    DBInstanceClass: 'db.t3.medium',
    AvailabilityZone: {
      'Fn::Select': [
        0,
        {
          'Fn::GetAZs': '',
        },
      ],
    },
    DBClusterIdentifier: '${apiName}Cluster',
  });`);
  }

  public initializeTestForCountResources(service: string, count: number) {
    this.code.line(`expect(stack).toCountResources('${service}', ${count});`);
  }
}
