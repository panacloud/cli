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

  constructor(props: StackBuilderProps) {
    this.config = props.config;
  }

  async mockApiTestCollectionsFile() {
    const code = new CodeMaker();
    const ts = new TypeScriptWriter(code);

    code.openFile("testCollectionsTypes.ts");

    if (this.config.api.mockApiData?.imports) {
      ts.writeImports("./types", [
        ...this.config.api.mockApiData?.imports,
      ]);
    }
    code.line();
    code.indent(`export ${this.config.api.mockApiData?.types}`);

    code.closeFile("testCollectionsTypes.ts");
    await code.save(this.outputDir);

    code.openFile(this.outputFile);

    ts.writeImports("./testCollectionsTypes", ["TestCollection"]);
    
    if (this.config.api.mockApiData?.enumImports.length !== 0) {
      ts.writeImports("./types", [
        ...this.config.api.mockApiData?.enumImports!,
      ]);
    }
    code.line();
    code.indent(`export const testCollections: TestCollection = {
        fields: 
        ${JSON.stringify(this.config.api.mockApiData?.collections.fields)} 
    }
    `);

    code.closeFile(this.outputFile);
    await code.save(this.outputDir);

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
