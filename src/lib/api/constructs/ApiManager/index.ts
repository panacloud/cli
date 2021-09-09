import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class apiManager {
  code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
  public apiManagerInitializer(apiName: string) {
    const ts = new TypeScriptWriter(this.code);
    ts.writeVariableDeclaration(
      {
        name: "apiManager",
        typeName: "PanacloudManager",
        initializer: () => {
          this.code.line(`new PanacloudManager(this, "${apiName}APIManager")`);
        },
      },
      "const"
    );
  }
}
