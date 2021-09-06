export enum APITYPE {
  graphql = "GraphQL",
  rest = "REST OpenAPI",
}

export enum LAMBDASTYLE {
  single = "Single",
  multi = "Multiple",
}

export enum DATABASE {
  dynamo = "DynamoDB (NoSQL)",
  neptune = "Neptune (Graph)",
  aurora = "Aurora Serverless (Relational)",
  document = "DocumentDB (NoSQL MongoDB)",
}

export enum SAASTYPE {
  app = "App",
  api = "API",
}

export enum CONSTRUCTS {
  appsync = "AppsyncConstruct",
  dynamodb = "DynamodbConstruct",
  lambda = "LambdaConstruct",
  neptuneDb = "VpcNeptuneConstruct",
  auroradb = "AuroraDbConstruct",
  apigateway = "ApiGatewayConstruct",
}

export enum TEMPLATE {
  basicApi = "Basic Skeleton API",
  todoApi = "Todo CRUD API",
  defineApi = "Define Your Own API",
}

export enum CLOUDPROVIDER {
  aws = "AWS",
}

export enum LANGUAGE {
  typescript = "TypeScript",
}

export interface Config {
  entityId: string;
  api_token: string;
  cloudProvider: CLOUDPROVIDER;
  language: LANGUAGE;
  saasType: SAASTYPE;
  template: TEMPLATE;
  api: API;
  workingDir?:string;
  type?:any
}

export interface API {
  apiName: string;
  schemaPath: string;
  apiType: APITYPE;
  lambdaStyle: LAMBDASTYLE;
  database: DATABASE;
}
