# Build a GraphQL Serverless API for a Simple Schema using Panacloud CLI and Deploy it on AWS

Before getting started you need to install the following packages and libraries:

1. Install [Node.js](https://nodejs.org/en/)
2. Install [AWS CLI Version 2.x](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
3. Install [AWS CDK Version 2](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-v2.html)
4. Install Globally [TypeScript](https://www.typescriptlang.org/download)

Now Globally Install Panacloud CLI:

npm install @panacloud/cli -g 

Panacloud recommends using API-First and API Design-First approach in developing APIs.

Please read these articles to understand the approach:

[API-First, API Design-First, or Code-First: Which Should You](https://blog.stoplight.io/api-first-api-design-first-or-code-first-which-should-you-choose)

[Schema-First GraphQL: The Road Less Travelled](https://blog.mirumee.com/schema-first-graphql-the-road-less-travelled-cf0e50d5ccff)

In order to start learning to develop Serverless GraphQL APIs we have developed a very simple schema in the `user.graphql` file at the root of this tutorial.

You can learn how to develop GraphQL schemas from [the schema official documentation](https://graphql.org/learn/schema/)

Now we will generate an AWS CDK project using the panacloud cli.

mkdir my_user_api

cd my_user_api

panacloud init

On the command promt answer the question:

Which Kind of Mutli-Tenant Serverless API? Select: Generate Multi-Tenant Serverless API Scaffolding from Schema

Select API Type? Select: GraphQL 

GraphQL Schema File Path: ../user.graphql

API Name: MyUserAPI

Nested Resolver: No

Select Database? Neptune (Graph) 

Now the MyUserAPI code is generated and available in the `my_user_api` directory.

Now lets review the different directories and files in the project:










