import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from 'codemaker';
let maker = new CodeMaker()

export const lambdaWithNeptuneFunction = () => {
  const ts = new TypeScriptWriter(maker);
  maker.line(
    `const isolated_subnets = VpcNeptuneConstruct_stack.VPCRef.isolatedSubnets;`
  );
  maker.line();
  maker.line(
    `const LambdaConstruct_stack = new LambdaConstruct(stack, 'LambdaConstructTest', {`
  );
  maker.line(`VPCRef: VpcNeptuneConstruct_stack.VPCRef,`);
  maker.line(`SGRef: VpcNeptuneConstruct_stack.SGRef,`);
  maker.line(
    `neptuneReaderEndpoint: VpcNeptuneConstruct_stack.neptuneReaderEndpoint,`
  );
  maker.line(`});`);
  maker.line();
  maker.line(
    `const cfn_cluster = VpcNeptuneConstruct_stack.node.children.filter(`
  );
  maker.line(`(elem) => elem instanceof cdk.aws_neptune.CfnDBCluster`);
  maker.line(`);`);
};

export const lambdaWithAuroraFunction = () => {
  const ts = new TypeScriptWriter(maker);
  maker.line(
    `const LambdaConstruct_stack = new LambdaConstruct(stack, 'LambdaConstructTest', {`
  );
  maker.line(`vpcRef: AuroraDbConstruct_stack.vpcRef,`);
  maker.line(`secretRef: AuroraDbConstruct_stack.secretRef,`);
  maker.line(`serviceRole: AuroraDbConstruct_stack.serviceRole,`);
  maker.line(`});`);
};