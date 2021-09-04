import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from 'codemaker';
let maker = new CodeMaker();


export const subnetFunction = () => {
  const ts = new TypeScriptWriter(maker);
  maker.line(
    `const subnets = VpcNeptuneConstruct_stack.VPCRef.isolatedSubnets;`
  );
  maker.line(`const subnetRefArray = [];`);
  maker.line(`for (let subnet of subnets) {`);
  maker.line(`subnetRefArray.push({`);
  maker.line(
    `Ref: stack.getLogicalId(subnet.node.defaultChild as cdk.CfnElement),`
  );
  maker.line(`});`);
  maker.line(`}`);
};

export const isolatedFunction = () => {
  const ts = new TypeScriptWriter(maker);
  maker.line(
    `const isolated_subnets = VpcNeptuneConstruct_stack.VPCRef.isolatedSubnets;`
  );
  maker.line(`const isolatedRouteTables = [`);
  maker.line(`isolated_subnets[0].routeTable,`);
  maker.line(`isolated_subnets[1].routeTable,`);
  maker.line(`]`);
};