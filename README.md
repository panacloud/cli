[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@panacloud/cli.svg)](https://www.npmjs.org/package/@panacloud/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@panacloud/cli.svg)](https://www.npmjs.org/package/@panacloud/cli)
[![License](https://img.shields.io/npm/l/@panacloud/cli.svg)](https://github.com/panacloud/cli/blob/master/package.json)

# Panacloud Command Line Interface (CLI)

[Panacloud CLI Discord Channel](https://discord.gg/uQ7vPXuu5v)

In a recent [report](https://venturebeat.com/2021/12/09/report-75-of-devs-indicate-that-participating-in-api-economy-is-top-priority/) 75% of developers indicate that participating in API economy is ‘top priority’. Panacloud is an unified API development, fundraising, and ownership economy platform.  It provides services, libraries, tools, and frameworks for developing totally open multi-tenant, serverless cloud services with integrated multi-tenant billing, crowdfunding, and ownership economy constructs.  This allows developers to concentrate solely on creating specialised code related to their domain, leaving the rest to the Panacloud platform and services. This model has the potential to disrupt both the software and venture investment industries and making the API developers rich and owners of their own destiny and unicorn startups.

Panacloud CLI accelerates the building of modern multi-tenant serverless SaaS APIs. The CLI applies the design-first paradigm and implements the best practices for designing GraphQL APIs using public cloud serverless and infrastructure as code technologies. The CLI takes a [GraphQL API](https://graphql.org/) [schema](https://graphql.org/learn/schema/) that has been augmented with Panacloud directives and creates [infrastructure as code (IaC)](https://acloudguru.com/blog/engineering/cloudformation-terraform-or-cdk-guide-to-iac-on-aws), mock lambdas, tests, and scaffolding for genuine lambdas that include business logic and database requests. It makes use of [AWS CDK](https://aws.amazon.com/cdk/) for IaC. It now only supports AWS, TypeScript and GraphQL, but future versions will also support Azure and Google Cloud, OpenAPI and other languages as well.

![CLI Flow](img/cli.png "CLI Diagram")


The generated serverless SaaS API project supports multi-tenant usage based billing and monetering and is closely integrated with the [Panacloud portal](https://www.panacloud.org). The developer just needs to write the specific code required by the Multi-Tenant SaaS project. This greatly reduces custom developer coding and increases speed to market. GraphQL and Open REST APIs can be built by using the Panacloud CLI. The APIs may use Graph or Relational databases, etc.

We have also published detailed [Tutorials](https://github.com/panacloud-modern-global-apps/full-stack-serverless-cdk) to help you to learn AWS CDK. 

Before getting started you need to install the following packages and libraries:

1. Install [Node.js](https://nodejs.org/en/)
2. Install [AWS CLI Version 2.x](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
3. Install [AWS CDK Version 2](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-v2.html)
4. Install Globally [TypeScript](https://www.typescriptlang.org/download)

Before starting your API project learn to develop APIs using this [bootcamp](https://github.com/panacloud/bootcamp-2021#part-3-introduction-to-serverless-and-cloud-computing-using-cdk) and [learning API repo](https://github.com/panacloud-modern-global-apps/api-design-prototype-testing)

The first step in developing a GraphQL [schema](https://dgraph.io/blog/post/designing-graphql-schemas/) for your APIs. Once you have built your GraphQL schema and enhanced it with Panacloud directives, we will now use this CLI to develop the serverless cloud APIs.

The code generated by the CLI will consist of two parts:

1. Code that will be managed and updated by the CLI. As we add and update the API schema, we will update the generated code using the CLI.
2. Code that is editable by the API developer and is contained in the editiable_src directory. This code code contains the buisiness logic and is edited and updated by the developer.

Note: The developer can also modify and add the IaC CDK code by using [CDK aspects](https://docs.aws.amazon.com/cdk/latest/guide/aspects.html).

Now Globally Install Panacloud CLI:

npm install @panacloud/cli -g 

<!-- toc -->
* [Panacloud Command Line Interface](#panacloud-command-line-interface)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @panacloud/cli
$ panacloud COMMAND
running command...
$ panacloud (-v|--version|version)
@panacloud/cli/0.0.3 win32-x64 node-v14.16.1
$ panacloud --help [COMMAND]
USAGE
  $ panacloud COMMAND
...
```
<!-- usagestop -->

# Panacloud Commands

<!-- commands -->
* [`panacloud help [COMMAND]`](#panacloud-help-command)
* [`panacloud init`](#panacloud-init)
* [`panacloud update`](#panacloud-update)
* [`panacloud status`](#panacloud-status)
* [`panacloud client`](#panacloud-client)
* [`panacloud merge`](#panacloud-merge)

## `panacloud help [COMMAND]`

display help for panacloud

```
USAGE
  $ panacloud help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `panacloud init`

Generates CDK code, mock lambdas, and actual lambdas based on the given schema

```
USAGE
  $ panacloud init

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/init.ts](https://github.com/panacloud/cli/commands/init.ts)_
<!-- commandsstop -->


## `panacloud update`

Update CDK code and mock lambdas based on the updated schema. This command doesnot overwrite code in the editiable_src directory.

```
USAGE
  $ panacloud update

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/update.ts](https://github.com/panacloud/cli/src/commands/update.ts)_
<!-- commandsstop -->




## `panacloud client`

Open a API explorer in the browser to query the API.

```
USAGE
  $ panacloud client

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/client.ts](https://github.com/panacloud/cli/src/commands/client.ts)_
<!-- commandsstop -->



## `panacloud merge`

Merges GraphQL schema files.

```
USAGE
  $ panacloud merge

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/update.ts](https://github.com/panacloud/cli/src/commands/merge.ts)_
<!-- commandsstop -->

# Project NPM Commands

Once the project is generated you may run the following npm scripts

<!-- npm commands -->
* `npm run deploy-dev` Deploy Development Stage
* `npm run deploy-prd` Deploy Production Stage
* `npm run destroy-dev` Destroy Development Stage
* `npm run destroy-prd` Destroy Production Stage
* `npm run test-dev` Run Tests for the Development Stage
* `npm run test-prd` Run Tests for the Production Stage


## Details about the Project Generated by the CLI

The CLI generates project for Multi-Tenant Serverless API development with [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/latest/guide/home.html) using TypeScript. It comes with all the necessary code to develop and deploy a Serverless GraphQL API in the AWS Cloud.  This includes the provisioning of cloud infrastructure in code and Serverless stubs where developers may easily include their business logic. The project also provides pre-built mock lambda functions and unit tests to test your deployed APIs. 

The project code may be conceptually divided into two parts:

1. The code that is generated by the Panacloud CLI, and will continuously be updated by the CLI as your API schema evolves. If the developer edits and updated this code, it will be overwritten next time the schema is updated and Panacloud CLI update command is given.
2. The code that the developer edits and updates and contains the business logic for the APIs. This code is contained in the `editable_src/` directory. 

It is highly recommended that the developer only edit and update the code contained in the `editable_src/` directory because the rest of the code is generated and updated by the Panacloud CLI.

The generated project code includes the mock lambdas contained in the `mock_lambda` directory in the root project folder. Typically, the developer will write business logic in the stub lambdas contained in the `editable_src/lambdas/` directory. The configuration contained in the `editable_src/panacloudconfig.json` file decides which lambda the APIs will call. Therefore, the project may be using mock lambdas in some calls and the real stub lambdas in other calls. This flexibility allows the developer to seamlessly transition from mock APIs towards real APIs, without the API users and testers even noticing it. Also, the mock APIs may be deployed right away.

The API CDK stack (cloud infrastructure in code) is generated by the Panacloud CLI `panacloud init` command given the API schema. API development is an iterative process, therefore when the developer updates the API schema in the `editable_src/graphql/schema/` directory and runs the `panacloud update` command the project's CDK code is updated. Given this cycle, most of the CDK stack is generated and updated by the Panacloud CLI. However, the developer has the flexibility to add and update the CDK stack by adding and updating visitors in the `editable_src/aspects/` directory. The Panacloud framework uses [Aspects](https://docs.aws.amazon.com/cdk/latest/guide/aspects.html) to enhance generated constructs and add cloud constructs written by the API developers.

The `editable_src/` directory contains all the code which the developer edits.  

The `editable_src/lambdas/` directory contains all the lambda stubs where the developer writes the business logic.  

The `editable_src/panacloudconfig.json` file tells the Panacloud framework which lambda functions to call.

The `editable_src/aspects` directory contains all the CDK code which the developer adds to the project CDK stack.  

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## The Panacloud Dapp and Protocol Complements the CLI

 The [Panacloud Dapp](https://www.panacloud.org/) and [protocol](https://github.com/panacloud/protocol) complements this CLI and facilitates the API developer to: 
 
 1. [Tokenize](https://cryptonews.com/news/tokenization-crowdfunding-in-the-era-of-cryptocurrency-and-b-10972.htm) the APIs and raise funding for API development.
 2. Document the developer ownership of the API by issuing you an [NFT](https://ethereum.org/en/nft/).
 3. Market the APIs to the application developers in the API bazaar/store.
 4. Create a decentralized [autonomous organization (DAO)](https://ethereum.org/en/dao/) for the APIs for governance in which the API token holders i.e. developer, investors, and users can participate.
 5. Monitor APIs and do multi-tenant billing and clearing on the Ethereum blockchain using smart contracts. 
 6. Issue tokens to API early adopters and users to incentivize them to subscribe and use the APIs and become a participant in the [Owership Economy](https://variant.fund/writing/the-ownership-economy-crypto-and-consumer-software).
 8. Allow the stakeholders to cash out whenever they require liquidity by selling API tokens.


 ## The Panacloud CLI Roadmap

### First Public Release

Release Date: December 25, 2021

Functionality:

1. DynamoDB 
2. Neptune & AuroraDB
3. Microservice dirrective
4. Multiple stacks
5. MockData & MockLambda 
6. panacloud status
7. panacloud client
 
### Second Release

Expected Date: January 15, 2022

Functionality: 

1. API Tests
2. Async Dirrective
3. Nested Resolver 
4. Return Type ( Issues with DynamoDB & Neptune )

### Third Release

Expected Date: Feburary 1, 2022

Functionality: 

Multi-Tenant monetering and billing data live streamed to Amazon Timestream Database deployed in Panacloud AWS Account. 

### Fourth Release

Expected Date: March 1, 2022

Functionality: Basic OpenAPI speficication support. 




