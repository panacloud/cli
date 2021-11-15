Thing to do in the CLI:

1. Remove Bug: If we give update command without changing the schema it updates the schema and tests

2. Rename the lambdaLayer to mockLambdaLayer. 
There are three seprate concepts here in this context:
a. Mock lambda layer.
b. Test collection data types.
c. The test data itself (This test data is used in two ways in the mock lambdas on the server and on the client to test the APIs)(This test data can be auto-generated and also manually produced)

Therefore, we must have a test data file in the editiable_src directory so that developer can add the test data manually. 

This means we will have a second testCollection in the editable_src, so that developer can also manually add test data. 
Note: If the developer has written and developed the real lambda may be only manually written test data should be used to run tests.
Maybe have a test collection configuration in the panacloudconfig.json

4. Make a backup copy of schema and panacloudconfig.json in the hidden .panacloud directory (just like git tool makes in .git). So that when we give panacloud update command we know what has changed and what is unchanged. This way we will be able to inform the developer. 

5. Create Database connection object, request object and response object in real lambda stubs. 

6. If we Update the schema and run the update command:
updateUser (
    # Name for the User item
    user: User!): User!

It gives the following error:

 ../../.././bin/run update
✔ Everything's fine
⠙ Updating CDK Code...    Error: The type of Mutation.updateUser(user:) must be Input Type but got: User!.

It also re-generates a lot of code.

What it should do is that if there is an error, it should not re-generate code at all.










