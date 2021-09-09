import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from "codemaker";

export const subnetFunction = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  _code.line(
    `const subnets = VpcNeptuneConstruct_stack.VPCRef.isolatedSubnets;`
  );
  _code.line(`const subnetRefArray = [];`);
  _code.line(`for (let subnet of subnets) {`);
  _code.line(`subnetRefArray.push({`);
  _code.line(
    `Ref: stack.getLogicalId(subnet.node.defaultChild as cdk.CfnElement),`
  );
  _code.line(`});`);
  _code.line(`}`);
};

export const isolatedFunction = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  _code.line(
    `const isolated_subnets = VpcNeptuneConstruct_stack.VPCRef.isolatedSubnets;`
  );
  _code.line(`const isolatedRouteTables = [`);
  _code.line(`isolated_subnets[0].routeTable,`);
  _code.line(`isolated_subnets[1].routeTable,`);
  _code.line(`]`);
};
