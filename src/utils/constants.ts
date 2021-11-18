import { IntrospectionQuery } from "graphql";

export const async_response_mutName = 'async_response'

export enum APITYPE {
  graphql = "GraphQL",
  rest = "REST OpenAPI",
}

export enum DATABASE {
  dynamoDB = "DynamoDB (NoSQL)",
  neptuneDB = "Neptune (Graph)",
  auroraDB = "Aurora Serverless (Relational)",
  documentDB = "DocumentDB (NoSQL MongoDB)",
  none = "None",
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
  eventBridge = "EventBridgeConstruct",
}

export enum TEMPLATE {
  basicApi = "Basic Multi-Tenant Serverless API Scaffolding",
  todoApi = "Todo CRUD Multi-Tenant Serverless API",
  defineApi = "Generate Multi-Tenant Serverless API Scaffolding from Schema",
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
  entityId?: string;
  api_token?: string;
  saasType: SAASTYPE;
  api: API;
}

export interface mockApiData {
  collections: any;
  types: any;
  imports: string[];
  enumImports: string[];
}

export type nestedResolverFieldsAndLambda = {
  nestedResolverFields: {[key: string]: {fieldName:string,lambda:string}[] },
  nestedResolverLambdas: string[]
}
export interface API {
  template: TEMPLATE;
  language?: LANGUAGE;
  cloudprovider?: CLOUDPROVIDER;
  apiName: string;
  schemaPath: string;
  schema?: IntrospectionQuery | string;
  nestedResolverFieldsAndLambdas?:nestedResolverFieldsAndLambda
  createMockLambda?: string[];
  createNestedResolverLambdaOnUpdate?: string[];
  // nestedResolverLambdas?:string[]
  // nestedResolverFields?:{[key: string]: {fieldName:string,lambda:string}[]}
  queiresFields?: string[];
  mutationFields?: string[];
  apiType: APITYPE;
  database: DATABASE;
  nestedResolver?: boolean;
  mockApiData?: mockApiData;
  microServiceFields?:{
    [k: string]: any[];
};
  generalFields?: string[],
  asyncFields?:string[]
}

export enum ARCHITECTURE {
  requestDriven = "Request-Driven Architecture",
  eventDriven = "Event-Driven Architecture",
}

export type PanacloudconfigFile = {
  lambdas: any;
  nestedLambdas?:any;
  mockLambdaLayer?:any
};

export type PanacloudConfiglambdaParams = {
  asset_path: string;
  is_mock:boolean
};
