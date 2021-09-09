import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from "codemaker";
import { CONSTRUCTS } from "../../../../../../utils/constants";

export const lambdaWithNeptuneFunction = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  _code.line(
    `const isolated_subnets = ${CONSTRUCTS.neptuneDB}_stack.VPCRef.isolatedSubnets;`
  );
  _code.line();
  _code.line(
    `const ${CONSTRUCTS.lambda}_stack = new ${CONSTRUCTS.lambda}(stack, '${CONSTRUCTS.lambda}Test', {`
  );
  _code.line(`VPCRef: ${CONSTRUCTS.neptuneDB}_stack.VPCRef,`);
  _code.line(`SGRef: ${CONSTRUCTS.neptuneDB}_stack.SGRef,`);
  _code.line(
    `neptuneReaderEndpoint: ${CONSTRUCTS.neptuneDB}_stack.neptuneReaderEndpoint,`
  );
  _code.line(`});`);
  _code.line();
  _code.line(
    `const cfn_cluster = ${CONSTRUCTS.neptuneDB}_stack.node.children.filter(`
  );
  _code.line(`(elem) => elem instanceof cdk.aws_neptune.CfnDBCluster`);
  _code.line(`);`);
};

export const lambdaWithAuroraFunction = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  _code.line(
    `const ${CONSTRUCTS.lambda}_stack = new ${CONSTRUCTS.lambda}(stack, '${CONSTRUCTS.lambda}Test', {`
  );
  _code.line(`vpcRef: ${CONSTRUCTS.auroraDB}_stack.vpcRef,`);
  _code.line(`secretRef: ${CONSTRUCTS.auroraDB}_stack.secretRef,`);
  _code.line(`serviceRole: ${CONSTRUCTS.auroraDB}_stack.serviceRole,`);
  _code.line(`});`);
};
