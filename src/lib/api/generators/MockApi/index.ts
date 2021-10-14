import { CodeMaker } from "codemaker";
import { ApiModel } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import fse = require("fs-extra");

type StackBuilderProps = {
  config: ApiModel;
};

class MockApiTestCollectionsFile {
  outputFile: string = `testCollections.ts`;
  outputDir: string = `types`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async mockApiTestCollectionsFile() {
    const ts = new TypeScriptWriter(this.code);

    this.code.openFile("testCollectionsTypes.ts");

    if (this.config.api.mockApiData?.imports) {
      ts.writeImports("../../editable_src/graphql/types", [
        ...this.config.api.mockApiData?.imports,
      ]);
    }
    this.code.line();
    this.code.indent(`export ${this.config.api.mockApiData?.types}`);

    this.code.closeFile("testCollectionsTypes.ts");
    await this.code.save(this.outputDir);

    this.code.openFile(this.outputFile);

    ts.writeImports("./testCollectionsTypes", ["TestCollection"]);
    if (this.config.api.mockApiData?.enumImports.length !== 0) {
      ts.writeImports("../../editable_src/graphql/types", [
        ...this.config.api.mockApiData?.enumImports!,
      ]);
    }
    this.code.line();
    this.code.indent(`export const testCollections: TestCollection = {
        fields: 
        ${JSON.stringify(this.config.api.mockApiData?.collections.fields)} 
    }
    `);

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);

    fse.copy("./types", "./lambdaLayer/mockApi").then(() => {
      fse.remove("./types").then(() => {});
    });
  }
}

export const mockApiTestCollections = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new MockApiTestCollectionsFile(props);
  await builder.mockApiTestCollectionsFile();
};
