import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import { CodeMaker } from "codemaker";

export const neptunePropertiesInitializer = (
  apiName: string,
  code: CodeMaker
) => {
  const ts = new TypeScriptWriter(code);
  code.line(`this.VPCRef = ${apiName}_vpc;`);
  code.line(`this.SGRef = ${apiName}_sg;`);
  code.line(
    `this.neptuneReaderEndpoint = ${apiName}_neptuneCluster.attrReadEndpoint`
  );
};
