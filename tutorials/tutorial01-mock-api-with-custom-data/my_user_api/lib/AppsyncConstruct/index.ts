import { aws_appsync as appsync, CfnOutput } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  myUserApi_lambdaFn_userArn: string;
  myUserApi_lambdaFn_addUserArn: string;
  prod?: string;
}

export class AppsyncConstruct extends Construct {
  public api_url: string;
  public api_key: string;

  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const myUserApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      props?.prod ? props?.prod + "myUserApi" : "myUserApi",
      {
        authenticationType: "API_KEY",
        name: props?.prod ? props?.prod + "myUserApi" : "myUserApi",
      }
    );
    const myUserApi_schema: appsync.CfnGraphQLSchema =
      new appsync.CfnGraphQLSchema(
        this,
        props?.prod ? props?.prod + "myUserApiSchema" : "myUserApiSchema",
        {
          apiId: myUserApi_appsync.attrApiId,
          definition: `scalar AWSDate
scalar AWSTime
scalar AWSDateTime
scalar AWSTimestamp
scalar AWSEmail
scalar AWSJSON
scalar AWSURL
scalar AWSPhone
scalar AWSIPAddress

type User {
  id: String!
  name: String
}

type Query {
  user (id: String): User
}

type Mutation {
  addUser (
    # Name for the User item
    name: String!): User!
}`,
        }
      );
    const myUserApi_apiKey: appsync.CfnApiKey = new appsync.CfnApiKey(
      this,
      "apiKey",
      {
        apiId: myUserApi_appsync.attrApiId,
      }
    );
    const myUserApi_serviceRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    myUserApi_serviceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const ds_myUserApi_addUser: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myUserApidataSourceGraphqladdUser"
          : "myUserApidataSourceGraphqladdUser",
        {
          name: props?.prod
            ? props?.prod + "myUserApi_dataSource_addUser"
            : "myUserApi_dataSource_addUser",
          apiId: myUserApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myUserApi_lambdaFn_addUserArn,
          },
          serviceRoleArn: myUserApi_serviceRole.roleArn,
        }
      );
    const ds_myUserApi_user: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "myUserApidataSourceGraphqluser"
        : "myUserApidataSourceGraphqluser",
      {
        name: props?.prod
          ? props?.prod + "myUserApi_dataSource_user"
          : "myUserApi_dataSource_user",
        apiId: myUserApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.myUserApi_lambdaFn_userArn },
        serviceRoleArn: myUserApi_serviceRole.roleArn,
      }
    );
    const user_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "user_resolver",
      {
        apiId: myUserApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "user",
        dataSourceName: ds_myUserApi_user.name,
      }
    );
    user_resolver.node.addDependency(myUserApi_schema);
    user_resolver.node.addDependency(ds_myUserApi_user);

    const addUser_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "addUser_resolver",
      {
        apiId: myUserApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "addUser",
        dataSourceName: ds_myUserApi_addUser.name,
      }
    );
    addUser_resolver.node.addDependency(myUserApi_schema);
    addUser_resolver.node.addDependency(ds_myUserApi_addUser);

    this.api_url = myUserApi_appsync.attrGraphQlUrl;
    this.api_key = myUserApi_apiKey.attrApiKey;
    new CfnOutput(
      this,
      props?.prod ? props.prod + "APIGraphQlURL" : "APIGraphQlURL",
      {
        value: myUserApi_appsync.attrGraphQlUrl,
        description: "The URL of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIURL"
          : "graphQlAPIURL",
      }
    );
    new CfnOutput(
      this,
      props?.prod ? props.prod + "GraphQLAPIKey" : "GraphQLAPIKey",
      {
        value: myUserApi_apiKey.attrApiKey || "",
        description: "The API Key of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIKey"
          : "graphQlAPIKey",
      }
    );
  }
}
