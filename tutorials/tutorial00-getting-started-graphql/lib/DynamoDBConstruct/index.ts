import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";
interface DynamoDBProps {
  prod?: string;
}

export class DynamoDBConstruct extends Construct {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: DynamoDBProps) {
    super(scope, id);

    const todoApi_table: dynamodb.Table = new dynamodb.Table(
      this,
      "todoApiTable",
      {
        tableName: props?.prod ? props?.prod + "_todoApi" : "todoApi",
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },
      }
    );
    this.table = todoApi_table;
  }
}
