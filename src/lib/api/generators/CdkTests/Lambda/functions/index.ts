import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from "codemaker";

export const lambdaWithNeptuneFunction = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  _code.line(
    `const isolated_subnets = VpcNeptuneConstruct_stack.VPCRef.isolatedSubnets;`
  );
  _code.line();
  _code.line(
    `const LambdaConstruct_stack = new LambdaConstruct(stack, 'LambdaConstructTest', {`
  );
  _code.line(`VPCRef: VpcNeptuneConstruct_stack.VPCRef,`);
  _code.line(`SGRef: VpcNeptuneConstruct_stack.SGRef,`);
  _code.line(
    `neptuneReaderEndpoint: VpcNeptuneConstruct_stack.neptuneReaderEndpoint,`
  );
  _code.line(`});`);
  _code.line();
  _code.line(
    `const cfn_cluster = VpcNeptuneConstruct_stack.node.children.filter(`
  );
  _code.line(`(elem) => elem instanceof cdk.aws_neptune.CfnDBCluster`);
  _code.line(`);`);
};

export const lambdaWithAuroraFunction = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  _code.line(
    `const LambdaConstruct_stack = new LambdaConstruct(stack, 'LambdaConstructTest', {`
  );
  _code.line(`vpcRef: AuroraDbConstruct_stack.vpcRef,`);
  _code.line(`secretRef: AuroraDbConstruct_stack.secretRef,`);
  _code.line(`serviceRole: AuroraDbConstruct_stack.serviceRole,`);
  _code.line(`});`);
};
