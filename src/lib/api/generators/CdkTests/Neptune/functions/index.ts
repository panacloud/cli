import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from "codemaker";
import { CONSTRUCTS } from "../../../../../../utils/constants";

export const subnetFunction = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  _code.line(
    `const subnets = ${CONSTRUCTS.neptuneDB}_stack.VPCRef.isolatedSubnets;`
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

  ts.writeVariableDeclaration(
    {
      name: `isolated_subnets`,
      typeName: "",
      initializer: () => {
        _code.line(`${CONSTRUCTS.neptuneDB}_stack.VPCRef.isolatedSubnets;`);
      },
    },
    "const"
  );
  _code.line();

  ts.writeVariableDeclaration(
    {
      name: `isolatedRouteTables`,
      typeName: "",
      initializer: () => {
        _code.line(`[
        isolated_subnets[0].routeTable,
        isolated_subnets[1].routeTable,
      ]`);
      },
    },
    "const"
  );
};
