import { aws_appsync as appsync } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
interface AppsyncProps {
  myApi_lambdaFn_getToDoArn: string;
  myApi_lambdaFn_getToDosArn: string;
  myApi_lambdaFn_createToDoArn: string;
  myApi_lambdaFn_updateToDoArn: string;
  myApi_lambdaFn_deleteToDoArn: string;
  myApi_lambdaFn_deleteToDosArn: string;
}

export class AppsyncConstruct extends Construct {
  public api_url: string;
  public api_key: string;

  constructor(scope: Construct, id: string, props?: AppsyncProps) {
    super(scope, id);

    const myApi_appsync: appsync.CfnGraphQLApi = new appsync.CfnGraphQLApi(
      this,
      "myApi",
      {
        authenticationType: "API_KEY",
        name: "myApi",
      }
    );
    const myApi_schema: appsync.CfnGraphQLSchema = new appsync.CfnGraphQLSchema(
      this,
      "myApiSchema",
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
    deleteToDo(toDoId: ID!): ToDo
    deleteToDos: [ToDo!]!
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

    const ds_myApi_createToDo: appsync.CfnDataSource =
      new appsync.CfnDataSource(this, "myApidataSourceGraphqlcreateToDo", {
        name: "myApi_dataSource_createToDo",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: {
          lambdaFunctionArn: props!.myApi_lambdaFn_createToDoArn,
        },
        serviceRoleArn: myApi_serviceRole.roleArn,
      });
    const ds_myApi_updateToDo: appsync.CfnDataSource =
      new appsync.CfnDataSource(this, "myApidataSourceGraphqlupdateToDo", {
        name: "myApi_dataSource_updateToDo",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: {
          lambdaFunctionArn: props!.myApi_lambdaFn_updateToDoArn,
        },
        serviceRoleArn: myApi_serviceRole.roleArn,
      });
    const ds_myApi_deleteToDo: appsync.CfnDataSource =
      new appsync.CfnDataSource(this, "myApidataSourceGraphqldeleteToDo", {
        name: "myApi_dataSource_deleteToDo",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: {
          lambdaFunctionArn: props!.myApi_lambdaFn_deleteToDoArn,
        },
        serviceRoleArn: myApi_serviceRole.roleArn,
      });
    const ds_myApi_deleteToDos: appsync.CfnDataSource =
      new appsync.CfnDataSource(this, "myApidataSourceGraphqldeleteToDos", {
        name: "myApi_dataSource_deleteToDos",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: {
          lambdaFunctionArn: props!.myApi_lambdaFn_deleteToDosArn,
        },
        serviceRoleArn: myApi_serviceRole.roleArn,
      });
    const ds_myApi_getToDo: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      "myApidataSourceGraphqlgetToDo",
      {
        name: "myApi_dataSource_getToDo",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.myApi_lambdaFn_getToDoArn },
        serviceRoleArn: myApi_serviceRole.roleArn,
      }
    );
    const ds_myApi_getToDos: appsync.CfnDataSource = new appsync.CfnDataSource(
      this,
      "myApidataSourceGraphqlgetToDos",
      {
        name: "myApi_dataSource_getToDos",
        apiId: myApi_appsync.attrApiId,
        type: "AWS_LAMBDA",
        lambdaConfig: { lambdaFunctionArn: props!.myApi_lambdaFn_getToDosArn },
        serviceRoleArn: myApi_serviceRole.roleArn,
      }
    );
    const getToDo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getToDo_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "getToDo",
        dataSourceName: ds_myApi_getToDo.name,
      }
    );
    getToDo_resolver.node.addDependency(myApi_schema);
    getToDo_resolver.node.addDependency(ds_myApi_getToDo);

    const getToDos_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getToDos_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Query",
        fieldName: "getToDos",
        dataSourceName: ds_myApi_getToDos.name,
      }
    );
    getToDos_resolver.node.addDependency(myApi_schema);
    getToDos_resolver.node.addDependency(ds_myApi_getToDos);

    const createToDo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "createToDo_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "createToDo",
        dataSourceName: ds_myApi_createToDo.name,
      }
    );
    createToDo_resolver.node.addDependency(myApi_schema);
    createToDo_resolver.node.addDependency(ds_myApi_createToDo);

    const updateToDo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "updateToDo_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "updateToDo",
        dataSourceName: ds_myApi_updateToDo.name,
      }
    );
    updateToDo_resolver.node.addDependency(myApi_schema);
    updateToDo_resolver.node.addDependency(ds_myApi_updateToDo);

    const deleteToDo_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "deleteToDo_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "deleteToDo",
        dataSourceName: ds_myApi_deleteToDo.name,
      }
    );
    deleteToDo_resolver.node.addDependency(myApi_schema);
    deleteToDo_resolver.node.addDependency(ds_myApi_deleteToDo);

    const deleteToDos_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "deleteToDos_resolver",
      {
        apiId: myApi_appsync.attrApiId,
        typeName: "Mutation",
        fieldName: "deleteToDos",
        dataSourceName: ds_myApi_deleteToDos.name,
      }
    );
    deleteToDos_resolver.node.addDependency(myApi_schema);
    deleteToDos_resolver.node.addDependency(ds_myApi_deleteToDos);

    this.api_url = myApi_appsync.attrGraphQlUrl;
    this.api_key = myApi_apiKey.attrApiKey;
  }
}
