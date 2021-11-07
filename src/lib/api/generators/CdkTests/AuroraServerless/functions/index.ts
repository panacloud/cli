import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from "codemaker";
import { CONSTRUCTS } from "../../../../../../utils/constants";

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

export const auroradbIdentifierCalls = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);

  ts.writeVariableDeclaration(
    {
      name: `public_subnets`,
      typeName: "",
      initializer: () => {
        _code.line(`${CONSTRUCTS.auroraDB}_stack.vpcRef.publicSubnets;`);
      },
    },
    "const"
  );
  _code.line();

  ts.writeVariableDeclaration(
    {
      name: `publicRouteTables`,
      typeName: "",
      initializer: () => {
        _code.line(`[
        public_subnets[0].routeTable,
        public_subnets[1].routeTable,
      ];`);
      },
    },
    "const"
  );
  _code.line();

  ts.writeVariableDeclaration(
    {
      name: `private_subnets`,
      typeName: "",
      initializer: () => {
        _code.line(`${CONSTRUCTS.auroraDB}_stack.vpcRef.privateSubnets;`);
      },
    },
    "const"
  );
  _code.line();

  ts.writeVariableDeclaration(
    {
      name: `privateRouteTables`,
      typeName: "",
      initializer: () => {
        _code.line(`[
        private_subnets[0].routeTable,
        private_subnets[1].routeTable,
      ];`);
      },
    },
    "const"
  );
  _code.line();

  natgatewayIdentifier("1", 0, _code);
  _code.line();
  natgatewayIdentifier("2", 1, _code);
  _code.line();
  internetGatewayIdentifier(_code);
  _code.line();
  eipIdentifier("1", 0, _code);
  _code.line();
  eipIdentifier("2", 1, _code);
};

const eipIdentifier = (epiNum: string, subnetNum: number, _code: CodeMaker) => {
  _code.line(`const eip${epiNum} = public_subnets[${subnetNum}].node.children.filter((elem) => {
        return elem instanceof cdk.aws_ec2.CfnEIP;
      });`);
};

const natgatewayIdentifier = (
  natGatewayNum: string,
  subnetNum: number,
  _code: CodeMaker
) => {
  _code.line(`const natGateway${natGatewayNum} = public_subnets[${subnetNum}].node.children.filter((elem) => {
        return elem instanceof cdk.aws_ec2.CfnNatGateway;
      });`);
};

const internetGatewayIdentifier = (_code: CodeMaker) => {
  _code.line(`const internetGateway = ${CONSTRUCTS.auroraDB}_stack.vpcRef.node.children.filter((elem) => {
        return elem instanceof cdk.aws_ec2.CfnInternetGateway;
      });`);
};
