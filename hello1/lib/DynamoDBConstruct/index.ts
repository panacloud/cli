import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";

export class DynamoDBConstruct extends Construct {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const myApi_table: dynamodb.Table = new dynamodb.Table(this, "myApiTable", {
      tableName: "myApi",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });
    this.table = myApi_table;
  }
}
