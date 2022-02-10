# Adding Stages for different envorinments in Panacloud Cli!

## Getting Started

Create a `user.graphql` schema file in your app directory and generate an AWS CDK project using the panacloud cli.

    mkdir my_user_api

    cd my_user_api

    panacloud init

Answer the following question on the command prompt:

* GraphQL Schema File Path? ../user.graphql

* API Name? MyUserAPI

* Select Database? Neptune (Graph) 

* Select Query Language? Gremlin

Now the MyUserAPI code is generated and available in the `my_user_api` directory.

# Short Summary (You must read) 
#### You can add different stages in your panacloud template. By Default it gives you two envoirnments i.e (dev , prd) development and production envoirnment. But If you want to add more stages you can ...

## Example
In the existing example after setting up the project we are going to add stages. Here in this example I am going to add stage `test` in panacloud project. Following are the steps to follow.

* Inside editable_src/panacloudconfig.json there will be an array of stage (By default dev and prd) we will add new stage `test`

     "stages": ["prd", "dev", "test"]   
     
  You can do this by directly adding `"test"` in stages array or by using `panacloud config --addStage test` command (doing through command is recommended)  

* Save the code and run update command 

    panacloud update

## Explaination

When you add new stage in editable_src/panacloudconfig.json and run update command i.e (panacloud update). It will automatically make changes in two files i.e (package.json and .panacloud/editable_src/panacloudconfig.json). In `.panacloud/editable_src/panacloudconfig.json` it make changes same like you make in `editable_src/panacloudconfig.json` and `package.json` it will add new stages and command like ...

    "deploy-test": "tsc && cross-env STAGE=test cdk deploy --outputs-file ./cdk-test-outputs.json",
    "destroy-test": "cross-env STAGE=test cdk destroy && del-cli --force ./cdk-test-outputs.json"

Now You can use these stages during deployment and destroying your stack like ...

    npm run deploy-test
    npm run destroy-test

## Remove Stage 

If you want to remove `test` stage you can do this by removing `test` from stages array in panacloudConfig.json or by using `panacloud config --deleteStage test` command (doing through command is recommended.Then,run `panacloud update` command.

## Understand the Project Generated by the CLI

This is a project for Multi-Tenant Serverless API development with [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/latest/guide/home.html) using TypeScript. It comes with all the necessary code to develop and deploy a Serverless GraphQL API in the AWS Cloud.  This includes the provisioning of cloud infrastructure in code and Serverless stubs where developers may easily include their business logic. The project also provides pre-built mock lambda functions and unit tests to test your deployed APIs. 

The project code may be conceptually divided into two parts:

1. The code that is generated by the Panacloud CLI, and will continuously be updated by the CLI as your API schema evolves. If the developer edits and updated this code, it will be overwritten next time the schema is updated and Panacloud CLI update command is given.
2. The code that the developer edits and updates and contains the business logic for the APIs. This code is contained in the `editable_src/` directory. 

It is highly recommended that the developer only edit and update the code contained in the `editable_src/` directory because the rest of the code is generated and updated by the Panacloud CLI.


