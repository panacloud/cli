import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from 'codemaker';


export const subnetAuroraFunction = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  _code.line(`const subnetRefArray = [];`);
  _code.line(`for (let subnet of private_subnets) {`);
  _code.line(`subnetRefArray.push({`);
  _code.line(
    `Ref: stack.getLogicalId(subnet.node.defaultChild as cdk.CfnElement),`
  );
  _code.line(`});`);
  _code.line(`};`);
};
