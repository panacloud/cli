import { CodeMaker } from "codemaker";
import { ApiModel } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { Imports } from "../../constructs/ConstructsImports";
const _ = require("lodash");

type StackBuilderProps = {
  config: ApiModel;
};

export class CdkAppStack {
  outputFile: string = `index.ts`;
  outputDir: string = `bin`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async CdkAppStackFile() {
    const ts = new TypeScriptWriter(this.code);
    this.outputFile = `${this.config.workingDir}.ts`;
    this.code.openFile(this.outputFile);
    const imp = new Imports(this.code);
    this.code.line(`import * as cdk from "aws-cdk-lib" `);
    ts.writeImports(`../lib/${this.config.workingDir}-stack`, [
      `${_.upperFirst(_.camelCase(this.config.workingDir))}Stack`,
    ]);

    ts.writeVariableDeclaration(
      {
        name: `app`,
        typeName: "cdk.App",
        initializer: () => {
          this.code.line(`new cdk.App()`);
        },
      },
      "const"
    );

    ts.writeVariableDeclaration({
      name:"stack",
      typeName: "",
      initializer: () =>{
        this.code.line(
          `new ${_.upperFirst(
            _.camelCase(this.config.workingDir)
          )}Stack(app, "${_.upperFirst(
            _.camelCase(this.config.workingDir)
          )}Stack", {});`
        );
    },
    },"const"
    )



    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const CdkAppClass = async (props: StackBuilderProps): Promise<void> => {
  const builder = new CdkAppStack(props);
  await builder.CdkAppStackFile();
};
