import { CodeMaker } from "codemaker";
import {
  ClassDefinition,
  Property,
  TypeScriptWriter,
} from "../../../../utils/typescriptWriter";
let maker = new CodeMaker();
const _ = require("lodash");

interface consturctProps {
  name: string;
  type: string;
}
export class Cdk extends CodeMaker {
  public initializeStack(name: string, contents: any) {
    const ts = new TypeScriptWriter(maker);
    const classDefinition: ClassDefinition = {
      name: `${_.upperFirst(_.camelCase(name))}Stack`,
      extends: "Stack",
      export: true,
    };
    ts.writeClassBlock(classDefinition)
  }

  public initializeConstruct(
    constructName: string,
    propsName: string = "StackProps",
    contents: any,
    constructProps?: consturctProps[],
    properties?: Property[]
  ) {
    const ts = new TypeScriptWriter(maker);
    this.line;
    if (constructProps) {
    ts.writeInterfaceBlock(propsName, constructProps)
      this.line();
    }
    const classDefinition: ClassDefinition = {
      name: `${_.upperFirst(_.camelCase(constructName))}`,
      extends: "Construct",
      export: true,
    };

    ts.writeClassBlock(classDefinition, properties, contents)
  }

  public nodeAddDependency(sourceName: string, valueName: string) {
    this.line(`${sourceName}.node.addDependency(${valueName});`);
  }

  public tagAdd(source: string, name: string, value: string) {
    this.line(`Tags.of(${source}).add("${name}", "${value}");`);
  }

  public initializeTest(
    description: string,
    contents: any,
    workingDir: string,
    pattern: string
  ) {
    const ts = new TypeScriptWriter(maker);
    if (pattern === "pattern_v1") {
      this.openBlock(`test("${description}", () => {`);
      this.line(`const app = new cdk.App()`);
      this.line(
        `const stack = new ${_.upperFirst(
          _.camelCase(workingDir)
        )}.${_.upperFirst(_.camelCase(workingDir))}Stack(app, "MyTestStack");`
      );
      this.line(
        `const actual = app.synth().getStackArtifact(stack.artifactId).template;`
      );
      this.line();
      contents();
      this.closeBlock(`})`);
    } else if (pattern === "pattern_v2") {
      this.openBlock(`test("${description}", () => {`);
      this.line(`const stack = new cdk.Stack();`);
      this.line();
      contents();
      this.closeBlock(`})`);
    }
  }
}