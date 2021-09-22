import { TypeScriptWriter } from "../../../../../../utils/typescriptWriter";
import { CodeMaker } from "codemaker";
import { CONSTRUCTS } from "../../../../../../utils/constants";

export const neptuneIdentifierCalls = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);
  
  ts.writeVariableDeclaration({
    name: "isolated_subnets",
    typeName: "",
    initializer: () => {
      _code.line(`${CONSTRUCTS.neptuneDB}_stack.VPCRef.isolatedSubnets;`)
    }
  }, "const")
  _code.line();

  ts.writeVariableDeclaration({
    name: `cfn_cluster`,
    typeName: "",
    initializer: () => {
      _code.line(`${CONSTRUCTS.neptuneDB}_stack.node.children.filter(
        (elem) => elem instanceof cdk.aws_neptune.CfnDBCluster
        );`)
    }
  }, "const")
};


export const auroradbIdentifierCalls = (_code: CodeMaker) => {
  const ts = new TypeScriptWriter(_code);

  ts.writeVariableDeclaration({
    name: `ServerlessCluster`,
    typeName: "",
    initializer: () => {
      _code.line(`${CONSTRUCTS.auroraDB}_stack.node.children.filter((elem) => {
        return elem instanceof cdk.aws_rds.ServerlessCluster;
      }); `)
    }
  }, "const")
  _code.line()

  ts.writeVariableDeclaration({
    name: `secret`,
    typeName: "",
    initializer: () => {
      _code.line(`ServerlessCluster[0].node.children.filter((elem) => {
        return elem instanceof cdk.aws_secretsmanager.Secret;
      });`)
    }
  }, "const")
  _code.line()

  ts.writeVariableDeclaration({
    name: `secretAttachment`,
    typeName: "",
    initializer: () => {
      _code.line(`secret[0].node.children.filter((elem) => {
        return elem instanceof cdk.aws_secretsmanager.SecretTargetAttachment;
      });`)
    }
  }, "const")
}
