import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from 'codemaker';
let maker = new CodeMaker();


export const subnetAuroraFunction = () => {
  const ts = new TypeScriptWriter(maker);
  maker.line(`const subnetRefArray = [];`);
  maker.line(`for (let subnet of private_subnets) {`);
  maker.line(`subnetRefArray.push({`);
  maker.line(
    `Ref: stack.getLogicalId(subnet.node.defaultChild as cdk.CfnElement),`
  );
  maker.line(`});`);
  maker.line(`};`);
};
