import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";
interface DynamoDBProps {
  prod?: string;
}

export class DynamoDBConstruct extends Construct {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: DynamoDBProps) {
    super(scope, id);

    const myTodoApi_table: dynamodb.Table = new dynamodb.Table(
      this,
      "myTodoApiTable",
      {
        tableName: props?.prod ? props?.prod + "_myTodoApi" : "myTodoApi",
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },
      }
    );
    this.table = myTodoApi_table;
  }
}
