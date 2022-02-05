import { aws_appsync as appsync, CfnOutput } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  todoApi_lambdaFn_userArn: string;
  todoApi_lambdaFn_addUserArn: string;
  prod?: string;
}

export class AppsyncConstruct extends Construct {
  public api_url: string;
  public api_key: string;

  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const todoApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      props?.prod ? props?.prod + "todoApi" : "todoApi",
      {
        authenticationType: "API_KEY",
        name: props?.prod ? props?.prod + "todoApi" : "todoApi",
      }
    );
    const todoApi_schema: appsync.CfnGraphQLSchema =
      new appsync.CfnGraphQLSchema(
        this,
        props?.prod ? props?.prod + "todoApiSchema" : "todoApiSchema",
        {
          apiId: todoApi_appsync.attrApiId,
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
    const todoApi_apiKey: appsync.CfnApiKey = new appsync.CfnApiKey(
      this,
      "apiKey",
      {
        apiId: todoApi_appsync.attrApiId,
      }
    );
    const todoApi_serviceRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    todoApi_serviceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const ds_todoApi_addUser: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "todoApidataSourceGraphqladdUser"
        : "todoApidataSourceGraphqladdUser",
      {
        name: props?.prod
          ? props?.prod + "todoApi_dataSource_addUser"
          : "todoApi_dataSource_addUser",
        apiId: todoApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.todoApi_lambdaFn_addUserArn },
        serviceRoleArn: todoApi_serviceRole.roleArn,
      }
    );
    const ds_todoApi_user: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      props?.prod
        ? props?.prod + "todoApidataSourceGraphqluser"
        : "todoApidataSourceGraphqluser",
      {
        name: props?.prod
          ? props?.prod + "todoApi_dataSource_user"
          : "todoApi_dataSource_user",
        apiId: todoApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.todoApi_lambdaFn_userArn },
        serviceRoleArn: todoApi_serviceRole.roleArn,
      }
    );
    const user_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "user_resolver",
      {
        apiId: todoApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "user",
        dataSourceName: ds_todoApi_user.name,
      }
    );
    user_resolver.node.addDependency(todoApi_schema);
    user_resolver.node.addDependency(ds_todoApi_user);

    const addUser_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "addUser_resolver",
      {
        apiId: todoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "addUser",
        dataSourceName: ds_todoApi_addUser.name,
      }
    );
    addUser_resolver.node.addDependency(todoApi_schema);
    addUser_resolver.node.addDependency(ds_todoApi_addUser);

    this.api_url = todoApi_appsync.attrGraphQlUrl;
    this.api_key = todoApi_apiKey.attrApiKey;
    new CfnOutput(
      this,
      props?.prod ? props.prod + "APIGraphQlURL" : "APIGraphQlURL",
      {
        value: todoApi_appsync.attrGraphQlUrl,
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
        value: todoApi_apiKey.attrApiKey || "",
        description: "The API Key of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIKey"
          : "graphQlAPIKey",
      }
    );
  }
}
