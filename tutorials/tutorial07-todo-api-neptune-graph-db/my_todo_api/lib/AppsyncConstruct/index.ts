import { aws_appsync as appsync, CfnOutput } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  myTodoApi_lambdaFn_getToDoArn: string;
  myTodoApi_lambdaFn_getToDosArn: string;
  myTodoApi_lambdaFn_createToDoArn: string;
  myTodoApi_lambdaFn_updateToDoArn: string;
  myTodoApi_lambdaFn_deleteToDoArn: string;
  myTodoApi_lambdaFn_deleteToDosArn: string;
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

  type ToDo {
    id: ID!
    title: String!
    description: String!
  }

  input ToDoInput {
    title: String!
    description: String!
  }
  type Query {
    getToDo(toDoId: ID!): ToDo!
    getToDos: [ToDo!]!
  }

  type Mutation {
    createToDo(toDoInput: ToDoInput): ToDo
    updateToDo(toDoId: ID!, toDoInput: ToDoInput): ToDo
    deleteToDo(toDoId: ID!): String
    deleteToDos: String
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

    const ds_myTodoApi_createToDo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqlcreateToDo"
          : "myTodoApidataSourceGraphqlcreateToDo",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_createToDo"
            : "myTodoApi_dataSource_createToDo",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_createToDoArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const ds_myTodoApi_updateToDo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqlupdateToDo"
          : "myTodoApidataSourceGraphqlupdateToDo",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_updateToDo"
            : "myTodoApi_dataSource_updateToDo",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_updateToDoArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const ds_myTodoApi_deleteToDo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqldeleteToDo"
          : "myTodoApidataSourceGraphqldeleteToDo",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_deleteToDo"
            : "myTodoApi_dataSource_deleteToDo",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_deleteToDoArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const ds_myTodoApi_deleteToDos: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqldeleteToDos"
          : "myTodoApidataSourceGraphqldeleteToDos",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_deleteToDos"
            : "myTodoApi_dataSource_deleteToDos",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_deleteToDosArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const ds_myTodoApi_getToDo: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqlgetToDo"
          : "myTodoApidataSourceGraphqlgetToDo",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_getToDo"
            : "myTodoApi_dataSource_getToDo",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_getToDoArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const ds_myTodoApi_getToDos: appsync.CfnDataSource =
      new appsync.CfnDataSource(
        this,
        props?.prod
          ? props?.prod + "myTodoApidataSourceGraphqlgetToDos"
          : "myTodoApidataSourceGraphqlgetToDos",
        {
          name: props?.prod
            ? props?.prod + "myTodoApi_dataSource_getToDos"
            : "myTodoApi_dataSource_getToDos",
          apiId: myTodoApi_appsync.attrApiId,
          type: "AWS_LAMBDA",
          lambdaConfig: {
            lambdaFunctionArn: props!.myTodoApi_lambdaFn_getToDosArn,
          },
          serviceRoleArn: myTodoApi_serviceRole.roleArn,
        }
      );
    const getToDo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getToDo_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "getToDo",
        dataSourceName: ds_myTodoApi_getToDo.name,
      }
    );
    getToDo_resolver.node.addDependency(myTodoApi_schema);
    getToDo_resolver.node.addDependency(ds_myTodoApi_getToDo);

    const getToDos_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getToDos_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "getToDos",
        dataSourceName: ds_myTodoApi_getToDos.name,
      }
    );
    getToDos_resolver.node.addDependency(myTodoApi_schema);
    getToDos_resolver.node.addDependency(ds_myTodoApi_getToDos);

    const createToDo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "createToDo_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "createToDo",
        dataSourceName: ds_myTodoApi_createToDo.name,
      }
    );
    createToDo_resolver.node.addDependency(myTodoApi_schema);
    createToDo_resolver.node.addDependency(ds_myTodoApi_createToDo);

    const updateToDo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "updateToDo_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "updateToDo",
        dataSourceName: ds_myTodoApi_updateToDo.name,
      }
    );
    updateToDo_resolver.node.addDependency(myTodoApi_schema);
    updateToDo_resolver.node.addDependency(ds_myTodoApi_updateToDo);

    const deleteToDo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "deleteToDo_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "deleteToDo",
        dataSourceName: ds_myTodoApi_deleteToDo.name,
      }
    );
    deleteToDo_resolver.node.addDependency(myTodoApi_schema);
    deleteToDo_resolver.node.addDependency(ds_myTodoApi_deleteToDo);

    const deleteToDos_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "deleteToDos_resolver",
      {
        apiId: myTodoApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "deleteToDos",
        dataSourceName: ds_myTodoApi_deleteToDos.name,
      }
    );
    deleteToDos_resolver.node.addDependency(myTodoApi_schema);
    deleteToDos_resolver.node.addDependency(ds_myTodoApi_deleteToDos);

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
