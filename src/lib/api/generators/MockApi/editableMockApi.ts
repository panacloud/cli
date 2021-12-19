import { CodeMaker } from "codemaker";
import { ApiModel, async_response_mutName } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import fse = require("fs-extra");
import { RootMockObject, TestCollectionType } from "../../apiMockDataGenerator";

type StackBuilderProps = {
  config: ApiModel;
  dummyData: TestCollectionType;
  type: string
};

class EditableMockApiTestCollectionsFile {
  outputFile: string = `testCollections.ts`;
  outputDir: string = `types`;
  config: ApiModel;
  dummyData: TestCollectionType;
  type: string


  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.dummyData = props.dummyData;
    this.type = props.type;
  }
  

  async mockApiTestCollectionsFile() {

    let new_config = JSON.parse(JSON.stringify(this.config));

    if(this.type === "update"){
      for (const key of this.config.api.createMockLambda!) {

        if (key !== async_response_mutName){
        const code = new CodeMaker();
        const ts = new TypeScriptWriter(code);
  
  
        if(new_config.api.mockApiData){
          new_config.api.mockApiData.types[key].fields[key] = `${JSON.stringify(new_config.api.mockApiData?.types[key].fields[key][0])}[]`;
        }
  
        code.openFile("testCollectionsTypes.ts");
  
        if (new_config.api.mockApiData?.imports) {
          ts.writeImports("../../../../types", [
            ...new_config.api.mockApiData?.imports.filter((val:string)=> val !== `Mutation${async_response_mutName.charAt(0).toUpperCase()}${async_response_mutName.slice(1)}Args`),
          ]);
        }
        code.line();
  
        // console.log("mean ", JSON.stringify(new_config.api.mockApiData?.types[key].fields[key][0]));
        
        code.indent(`export type TestCollection =
            ${JSON.stringify(new_config.api.mockApiData?.types[key]).replace(/"*\\*/g, '')}
        `);
  
        code.closeFile("testCollectionsTypes.ts");
        await code.save(`editable_src/customMockLambdaLayer/mockData/${key}`);
  
        ///TestCollections.ts
  
        const code1 = new CodeMaker();
        const ts1 = new TypeScriptWriter(code1);
  
        code1.openFile("testCollections.ts");
  
        ts1.writeImports("./testCollectionsTypes", ["TestCollection"]);
        if (new_config.api.mockApiData?.enumImports.length !== 0) {
          ts1.writeImports("../../../../types", [
            ...new_config.api.mockApiData?.enumImports!,
          ]);
        }
        code1.line();
        
        const enumPattern = /"[a-zA-Z_]+[.][a-zA-Z_]+"/g;
        let mockDataStr = `${JSON.stringify({ [key]: this.dummyData.fields[key] }, null, 2)}`;
        const matchEnums = mockDataStr.match(enumPattern);
        // console.log(matchEnums);
  
        matchEnums?.forEach(enumStr => {
          mockDataStr = mockDataStr.replace(enumStr, enumStr.slice(1, -1));
        })
  
        code1.indent(`export const testCollections: TestCollection = {
            fields: ${mockDataStr}
            
        }
        `);
  
        code1.closeFile("testCollections.ts");
        this.outputDir = `editable_src/customMockLambdaLayer/mockData/${key}`;
        await code1.save(this.outputDir);
  
      }
    }
    }
    else
    {

      for (const key in this.config.api.mockApiData?.collections.fields) {
        const code = new CodeMaker();
        const ts = new TypeScriptWriter(code);
  
        if (key !== async_response_mutName){

  
        if(new_config.api.mockApiData){
          new_config.api.mockApiData.types[key].fields[key] = `${JSON.stringify(new_config.api.mockApiData?.types[key].fields[key][0])}[]`;
        }
  
        code.openFile("testCollectionsTypes.ts");
  
        if (new_config.api.mockApiData?.imports) {
          ts.writeImports("../../../../types", [
            ...new_config.api.mockApiData?.imports.filter((val:string)=> val !== `Mutation${async_response_mutName.charAt(0).toUpperCase()}${async_response_mutName.slice(1)}Args`),
          ]);
        }
        code.line();
  
        // console.log("mean ", JSON.stringify(new_config.api.mockApiData?.types[key].fields[key][0]));
        
        code.indent(`export type TestCollection =
            ${JSON.stringify(new_config.api.mockApiData?.types[key]).replace(/"*\\*/g, '')}
        `);
  
        code.closeFile("testCollectionsTypes.ts");
        await code.save(`editable_src/customMockLambdaLayer/mockData/${key}`);
  
        ///TestCollections.ts
  
        const code1 = new CodeMaker();
        const ts1 = new TypeScriptWriter(code1);
  
        code1.openFile("testCollections.ts");
  
        ts1.writeImports("./testCollectionsTypes", ["TestCollection"]);
        if (new_config.api.mockApiData?.enumImports.length !== 0) {
          ts1.writeImports("../../../../types", [
            ...new_config.api.mockApiData?.enumImports!,
          ]);
        }
        code1.line();
        
        const enumPattern = /"[a-zA-Z_]+[.][a-zA-Z_]+"/g;
        let mockDataStr = `${JSON.stringify({ [key]: this.dummyData.fields[key] }, null, 2)}`;
        const matchEnums = mockDataStr.match(enumPattern);
        // console.log(matchEnums);
  
        matchEnums?.forEach(enumStr => {
          mockDataStr = mockDataStr.replace(enumStr, enumStr.slice(1, -1));
        })
  
        code1.indent(`export const testCollections: TestCollection = {
            fields: ${mockDataStr}
            
        }
        `);
  
        code1.closeFile("testCollections.ts");
        this.outputDir = `editable_src/customMockLambdaLayer/mockData/${key}`;
        await code1.save(this.outputDir);
  
      }
    }
  
    }

  }

}

export const EditableMockApiTestCollections = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new EditableMockApiTestCollectionsFile(props);
  await builder.mockApiTestCollectionsFile();
};
