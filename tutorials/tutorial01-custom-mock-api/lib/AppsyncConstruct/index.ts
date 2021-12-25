import { aws_appsync as appsync, CfnOutput } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  myApi_lambdaFn_userArn: string;
  myApi_lambdaFn_addUserArn: string;
  prod?: string;
}

export class AppsyncConstruct extends Construct {
  public api_url: string;
  public api_key: string;

  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const myApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      props?.prod ? props?.prod + "myApi" : "myApi",
      {
        authenticationType: "API_KEY",
        name: props?.prod ? props?.prod + "myApi" : "myApi",
      }
    );
    const myApi_schema: appsync.CfnGraphQLSchema = new appsync.CfnGraphQLSchema(
      this,
      props?.prod ? props?.prod + "myApiSchema" : "myApiSchema",
      {
        apiId: myApi_appsync.attrApiId,
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
  age: Int!
  nationality: String!
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
    const myApi_apiKey: appsync.CfnApiKey = new appsync.CfnApiKey(
      this,
      "apiKey",
      {
        apiId: myApi_appsync.attrApiId,
      }
    );
    const myApi_serviceRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    myApi_serviceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const ds_myApi_addUser: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "myApidataSourceGraphqladdUser"
        : "myApidataSourceGraphqladdUser",
      {
        name: props?.prod
          ? props?.prod + "myApi_dataSource_addUser"
          : "myApi_dataSource_addUser",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.myApi_lambdaFn_addUserArn },
        serviceRoleArn: myApi_serviceRole.roleArn,
      }
    );
    const ds_myApi_user: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "myApidataSourceGraphqluser"
        : "myApidataSourceGraphqluser",
      {
        name: props?.prod
          ? props?.prod + "myApi_dataSource_user"
          : "myApi_dataSource_user",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.myApi_lambdaFn_userArn },
        serviceRoleArn: myApi_serviceRole.roleArn,
      }
    );
    const user_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "user_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "user",
        dataSourceName: ds_myApi_user.name,
      }
    );
    user_resolver.node.addDependency(myApi_schema);
    user_resolver.node.addDependency(ds_myApi_user);

    const addUser_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "addUser_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "addUser",
        dataSourceName: ds_myApi_addUser.name,
      }
    );
    addUser_resolver.node.addDependency(myApi_schema);
    addUser_resolver.node.addDependency(ds_myApi_addUser);

    this.api_url = myApi_appsync.attrGraphQlUrl;
    this.api_key = myApi_apiKey.attrApiKey;
    new CfnOutput(
      this,
      props?.prod ? props.prod + "APIGraphQlURL" : "APIGraphQlURL",
      {
        value: myApi_appsync.attrGraphQlUrl,
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
        value: myApi_apiKey.attrApiKey || "",
        description: "The API Key of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIKey"
          : "graphQlAPIKey",
      }
    );
  }
}
