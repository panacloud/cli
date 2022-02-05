import { aws_appsync as appsync, CfnOutput } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  myTodoApi_lambdaFn_getTodosArn: string;
  myTodoApi_lambdaFn_addTodoArn: string;
  myTodoApi_lambdaFn_updateTodoArn: string;
  myTodoApi_lambdaFn_deleteTodoArn: string;
  prod?: string;
}

export class AppsyncConstruct extends Construct {
  public api_url: string;
  public api_key: string;

  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const myTodoApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      props?.prod ? props?.prod + "myTodoApi" : "myTodoApi",
      {
        authenticationType: "API_KEY",
        name: props?.prod ? props?.prod + "myTodoApi" : "myTodoApi",
      }
    );
    const myTodoApi_schema: appsync.CfnGraphQLSchema =
      new appsync.CfnGraphQLSchema(
        this,
        props?.prod ? props?.prod + "myTodoApiSchema" : "myTodoApiSchema",
        {
          apiId: myTodoApi_appsync.attrApiId,
          definition: `scalar AWSDate
scalar AWSTime
scalar AWSDateTime
scalar AWSTimestamp
scalar AWSEmail
scalar AWSJSON
scalar AWSURL
scalar AWSPhone
scalar AWSIPAddress

type Todo {
  id: ID!
  title: String!
  done: Boolean!
}

input TodoInput {
  id: ID!
  title: String!
  done: Boolean!
}

type Query {
  getTodos: [Todo] @microService(name:"todo")
}

type Mutation {
  addTodo(todo: TodoInput!): Todo   @microService(name:"todo") 
  updateTodo(todo: TodoInput!): Todo   @microService(name:"todo")
  deleteTodo(todoId: String!): String  @microService(name:"todo")
}`,
        }
      );
    const myTodoApi_apiKey: appsync.CfnApiKey = new appsync.CfnApiKey(
      this,
      "apiKey",
      {
        apiId: myTodoApi_appsync.attrApiId,
      }
    );
    const myTodoApi_serviceRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    myTodoApi_serviceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const ds_myTodoApi_addTodo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqladdTodo"
          : "myTodoApidataSourceGraphqladdTodo",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_addTodo"
            : "myTodoApi_dataSource_addTodo",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_addTodoArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const ds_myTodoApi_updateTodo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqlupdateTodo"
          : "myTodoApidataSourceGraphqlupdateTodo",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_updateTodo"
            : "myTodoApi_dataSource_updateTodo",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_updateTodoArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const ds_myTodoApi_deleteTodo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqldeleteTodo"
          : "myTodoApidataSourceGraphqldeleteTodo",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_deleteTodo"
            : "myTodoApi_dataSource_deleteTodo",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_deleteTodoArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const ds_myTodoApi_getTodos: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqlgetTodos"
          : "myTodoApidataSourceGraphqlgetTodos",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_getTodos"
            : "myTodoApi_dataSource_getTodos",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_getTodosArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const getTodos_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getTodos_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "getTodos",
        dataSourceName: ds_myTodoApi_getTodos.name,
      }
    );
    getTodos_resolver.node.addDependency(myTodoApi_schema);
    getTodos_resolver.node.addDependency(ds_myTodoApi_getTodos);

    const addTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "addTodo_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "addTodo",
        dataSourceName: ds_myTodoApi_addTodo.name,
      }
    );
    addTodo_resolver.node.addDependency(myTodoApi_schema);
    addTodo_resolver.node.addDependency(ds_myTodoApi_addTodo);

    const updateTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "updateTodo_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "updateTodo",
        dataSourceName: ds_myTodoApi_updateTodo.name,
      }
    );
    updateTodo_resolver.node.addDependency(myTodoApi_schema);
    updateTodo_resolver.node.addDependency(ds_myTodoApi_updateTodo);

    const deleteTodo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "deleteTodo_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "deleteTodo",
        dataSourceName: ds_myTodoApi_deleteTodo.name,
      }
    );
    deleteTodo_resolver.node.addDependency(myTodoApi_schema);
    deleteTodo_resolver.node.addDependency(ds_myTodoApi_deleteTodo);

    this.api_url = myTodoApi_appsync.attrGraphQlUrl;
    this.api_key = myTodoApi_apiKey.attrApiKey;
    new CfnOutput(
      this,
      props?.prod ? props.prod + "APIGraphQlURL" : "APIGraphQlURL",
      {
        value: myTodoApi_appsync.attrGraphQlUrl,
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
        value: myTodoApi_apiKey.attrApiKey || "",
        description: "The API Key of the GraphQl API",
        exportName: props?.prod
          ? props.prod + "graphQlAPIKey"
          : "graphQlAPIKey",
      }
    );
  }
}
