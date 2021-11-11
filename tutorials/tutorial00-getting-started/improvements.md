1. API URL and Key are not being printed and saved in a file

Note that the url and key is only available after deployment, therefore we cannot save it before deployment.



Reference:

///Print Graphql Api Url on console after deploy
    new cdk.CfnOutput(this, "APIGraphQlURL", {
      value: api.graphqlUrl
    })

    ///Print API Key on console after deploy
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });


2. We should read the lambda names from the config file not hard code it in the stack file

lambda.Code.fromAsset("mock_lambda/user")


3. Why embeding schama inside Appsync Construct


4. Rename auguments to request in tests

5. Muti-tenant billing constructs

6. Should be move AppSyncConstruct and VpcNeptureConstruct into a seprate npm repo










