import { Aspects } from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import { DefaultVisitor } from "./DefaultVisitor";
export class AspectController {
  constructor(scope: Stack) {
    Aspects.of(scope).add(new DefaultVisitor());
  }
}
