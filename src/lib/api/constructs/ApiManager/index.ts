import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
let maker = new CodeMaker();

export class apiManager {

  public apiManagerInitializer(apiName: string) {
    const ts = new TypeScriptWriter();
    ts.writeVariableDeclaration({
        name: "apiManager",
        typeName: "PanacloudManager",
        initializer:()=>{
          maker.line(`new PanacloudManager(this, "${apiName}APIManager")`);
        },
    },"const",maker)
  }
}
