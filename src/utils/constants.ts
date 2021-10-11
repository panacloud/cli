export enum APITYPE {
  graphql = "GraphQL",
  rest = "REST OpenAPI",
}

export enum DATABASE {
  dynamoDB = "DynamoDB (NoSQL)",
  neptuneDB = "Neptune (Graph)",
  auroraDB = "Aurora Serverless (Relational)",
  documentDB = "DocumentDB (NoSQL MongoDB)",
  none = "None"
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
  eventBridge = "EventBridgeConstruct"
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

export interface ApiModel {
  api: API;
  workingDir: string;
}

export interface Config {
  entityId: string;
  api_token: string;
  saasType: SAASTYPE;
  api: API;
}

export interface mockApiData {
  collections: any;
  types: any;
  imports: string[];
}

export interface API {
  template: TEMPLATE;
  language: LANGUAGE;
  cloudprovider: CLOUDPROVIDER;
  architecture: ARCHITECTURE;
  apiName: string;
  schemaPath: string;
  schema?: any;
  queiresFields?: string[];
  mutationFields?: string[];
  apiType: APITYPE;
  database: DATABASE;
  mockApiData?: mockApiData;
}

export enum ARCHITECTURE {
  requestDriven = "Request-Driven Architecture",
  eventDriven = "Event-Driven Architecture"
}
