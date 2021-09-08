export enum APITYPE {
  graphql = "GraphQL",
  rest = "REST OpenAPI",
}

export enum LAMBDASTYLE {
  single = "Single",
  multi = "Multiple",
}

export enum DATABASE {
  dynamoDB = "DynamoDB (NoSQL)",
  neptuneDB = "Neptune (Graph)",
  auroraDB = "Aurora Serverless (Relational)",
  documentDB = "DocumentDB (NoSQL MongoDB)",
}

export enum SAASTYPE {
  app = "App",
  api = "API",
}

export enum CONSTRUCTS {
  appsync = "AppsyncConstruct",
  dynamoDB = "DynamoDBConstruct",
  lambda = "LambdaConstruct",
  neptuneDB = "VpcNeptuneConstruct",
  auroraDB = "AuroraDBConstruct",
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
  saasType: SAASTYPE;
  api?: API;
}

export interface API {
  template: TEMPLATE;
  language: LANGUAGE;
  cloudprovider: CLOUDPROVIDER;
  apiName: string;
  schemaPath: string;
  schema?: any;
  apiType: APITYPE;
  lambdaStyle: LAMBDASTYLE;
  database: DATABASE;
}