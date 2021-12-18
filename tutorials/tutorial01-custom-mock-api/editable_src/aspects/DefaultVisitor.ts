import { IConstruct } from "constructs/lib/construct";
import { IAspect } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
export class DefaultVisitor implements IAspect {
  constructor() {}
  public visit(node: IConstruct): void {
    if (node instanceof lambda.Function) {
    }
  }
}
