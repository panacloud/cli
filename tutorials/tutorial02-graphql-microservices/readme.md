# Micro Services Directives for your Multi-Tenant Serverless API CDK TypeScript Project!

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
Mirco services directives can be used in the panacloud cli. By using these directives you can assemble all the related lambdas in on folder. Generally with panaclound cli you editable lambdas lies in editable_src/lambda_stubs folder but if you use Micro services Directives then inside lambda_stubs new folders will be created each named on the name you gave in the Micro Servies Directive. And all the related lambda lies in those folders.
