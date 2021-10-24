import { CodeMaker } from "codemaker";
import { ApiModel } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import fse = require("fs-extra");
import { RootMockObject, TestCollectionType } from "../../apiMockDataGenerator";

type StackBuilderProps = {
  config: ApiModel;
  dummyData: TestCollectionType;
};

class MockApiTestCollectionsFile {
  outputFile: string = `testCollections.ts`;
  outputDir: string = `types`;
  config: ApiModel;
  dummyData: TestCollectionType;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.dummyData = props.dummyData;
  }

  async mockApiTestCollectionsFile() {

    let new_config = JSON.parse(JSON.stringify(this.config));


    for (const key in new_config.api.mockApiData?.collections.fields) {
      const code = new CodeMaker();
      const ts = new TypeScriptWriter(code);

      if(new_config.api.mockApiData){
        new_config.api.mockApiData.types[key].fields[key] = `${JSON.stringify(new_config.api.mockApiData?.types[key].fields[key][0])}[]`;
      }

      code.openFile("testCollectionsTypes.ts");

      if (new_config.api.mockApiData?.imports) {
        ts.writeImports("../types", [
          ...new_config.api.mockApiData?.imports,
        ]);
      }
      code.line();
      
      code.indent(`export type TestCollection =
          ${JSON.stringify(new_config.api.mockApiData?.types[key]).replace(/"*\\*/g, '')}
      `);

      code.closeFile("testCollectionsTypes.ts");
      await code.save(`lambdaLayer/mockApi/${key}`);

      ///TestCollections.ts

      const code1 = new CodeMaker();
      const ts1 = new TypeScriptWriter(code1);

      code1.openFile("testCollections.ts");

      ts1.writeImports("./testCollectionsTypes", ["TestCollection"]);
      if (new_config.api.mockApiData?.enumImports.length !== 0) {
        ts1.writeImports("../types", [
          ...new_config.api.mockApiData?.enumImports!,
        ]);
      }
      code1.line();
      code1.indent(`export const testCollections: TestCollection = {
          fields: 
          ${JSON.stringify({[key]: this.dummyData.fields[key]})} 
      }
      `);

      code1.closeFile("testCollections.ts");
      this.outputDir = `lambdaLayer/mockApi/${key}`;
      await code1.save(this.outputDir);

    }

  }
}

export const mockApiTestCollections = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new MockApiTestCollectionsFile(props);
  await builder.mockApiTestCollectionsFile();
};
