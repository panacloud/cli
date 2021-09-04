import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import { CodeMaker } from "codemaker";
let maker = new CodeMaker();

export const neptunePropertiesInitializer = (
  apiName: string
) => {
  const ts = new TypeScriptWriter(maker);
  maker.line(`this.VPCRef = ${apiName}_vpc;`);
  maker.line(`this.SGRef = ${apiName}_sg;`);
  maker.line(
    `this.neptuneReaderEndpoint = ${apiName}_neptuneCluster.attrReadEndpoint`
  );
};