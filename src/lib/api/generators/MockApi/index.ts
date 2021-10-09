import { CodeMaker } from "codemaker";
import { ApiModel } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

type StackBuilderProps = {
  config: ApiModel;
};

class MockApiTestCollectionsFile {
  outputFile: string = `testCollections.ts`;
  outputDir: string = `lambdaLayer`;
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
      ts.writeImports("../custom_src/graphql/types", [
        ...this.config.api.mockApiData?.imports,
      ]);
    }
    this.code.line();
    this.code.indent(`export ${this.config.api.mockApiData?.types}`);

    this.code.closeFile("testCollectionsTypes.ts");
    await this.code.save(this.outputDir);

    this.code.openFile(this.outputFile);

    ts.writeImports("./testCollectionsTypes", ["TestCollection"]);
    this.code.line();
    this.code.indent(`export const testCollections: TestCollection = {
        fields: 
        ${JSON.stringify(this.config.api.mockApiData?.collections.fields)} 
    }
    `);

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const mockApiTestCollections = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new MockApiTestCollectionsFile(props);
  await builder.mockApiTestCollectionsFile();
};
