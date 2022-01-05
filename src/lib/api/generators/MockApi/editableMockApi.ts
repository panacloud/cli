import { CodeMaker } from "codemaker";
import { ApiModel, async_response_mutName } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import fse = require("fs-extra");
import { RootMockObject, TestCollectionType } from "../../apiMockDataGenerator";
import { transformStr } from "../../constructs/Lambda/utills";
import lodash = require("lodash");

type StackBuilderProps = {
  config: ApiModel;
  dummyData: TestCollectionType;
  type: string;
};

class EditableMockApiTestCollectionsFile {
  outputFile: string = `testCollections.ts`;
  outputDir: string = `types`;
  config: ApiModel;
  dummyData: TestCollectionType;
  type: string;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.dummyData = props.dummyData;
    this.type = props.type;
  }

  async mockApiTestCollectionsFile() {
    let new_config = JSON.parse(JSON.stringify(this.config));

    if (this.type === "update") {
      for (const key of this.config.api.createMockLambda!) {
        if (key !== async_response_mutName) {
          const code = new CodeMaker();
          const ts = new TypeScriptWriter(code);

          if (new_config.api.mockApiData) {
            new_config.api.mockApiData.types[key].fields[
              key
            ] = `${JSON.stringify(
              new_config.api.mockApiData?.types[key].fields[key][0]
            )}[]`;
          }
          code.openFile("testCollectionsTypes.ts");

          const allTypes = new_config.api.mockApiData?.imports
            .filter(
              (val: string) =>
                val !==
                `Mutation${async_response_mutName
                  .charAt(0)
                  .toUpperCase()}${async_response_mutName.slice(1)}Args`
            )
            .map((val: string) => {
              return val
                .split("_")
                .reduce(
                  (
                    out_str: string,
                    val: string,
                    index: number,
                    arr: string[]
                  ) => {
                    return (out_str += `${transformStr(val)}${
                      arr.length > index + 1 ? "_" : ""
                    }`);
                  },
                  ""
                );
            });
          if (new_config.api.mockApiData?.imports) {
            ts.writeImports("../types", allTypes);
          }
          code.line();
          let returnType = new_config.api.mockApiData?.types[key];
          let data1 = returnType.fields[key].replace(/\\*/g, "");
          let data2 = JSON.parse(data1.substring(0, data1.length - 2));

          if (typeof data2["arguments"] === "string") {
            data2["arguments"] = data2["arguments"]
              .split("_")
              .reduce(
                (
                  out_str: string,
                  val: string,
                  index: number,
                  arr: string[]
                ) => {

                  return (out_str += `${transformStr(val)}${
                    arr.length > index + 1 ? "_" : ""
                  }`);
                },
                ""
              );
          }
          if (typeof data2["response"] === "string") {
            data2["response"] = data2["response"]
              .split("_")
              .reduce(
                (
                  out_str: string,
                  val: string,
                  index: number,
                  arr: string[]
                ) => {
                  if (val.includes("|")) {
                    let commaStr = val
                      .split("|")
                      .reduce((outStr, val, index: number, arr: string[]) => {
                        val = val.replace(" ", "");

                        return (outStr += `${val
                          .charAt(0)
                          .toUpperCase()}${lodash.camelCase(val.slice(1))}${
                          arr.length > index + 1 ? "|" : ""
                        }`);
                      }, "");
                    return (out_str += commaStr);
                  }
                  if (val.includes("[]")) {
                    let commaStr = val
                      .split("[]")
                      .reduce((outStr, val, index: number, arr: string[]) => {
                        val = val.replace(" ", "");
  
                        return (outStr += `${val
                          .charAt(0)
                          .toUpperCase()}${lodash.camelCase(val.slice(1))}${
                          arr.length > index + 1 ? "[]" : ""
                        }`);
                      }, "");
                    return (out_str += commaStr);
                  }
                  return (out_str += `${val
                    .charAt(0)
                    .toUpperCase()}${lodash.camelCase(val.slice(1))}${
                    arr.length > index + 1 ? "_" : ""
                  }`);
                },
                ""
              );
          }
          returnType.fields[key] =
            JSON.stringify(data2).replace(/"*\\*/g, "") + "[]";


          code.indent(`export type TestCollection =
            ${JSON.stringify(returnType).replace(/"*\\*/g, "")}
        `);

          code.closeFile("testCollectionsTypes.ts");
          await code.save(`editable_src/customMockLambdaLayer/mockData/${key}`);

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

          const enumPattern = /"[a-zA-Z_]+[.][a-zA-Z_]+"/g;
          let mockDataStr = `${JSON.stringify(
            { [key]: this.dummyData.fields[key] },
            null,
            2
          )}`;
          const matchEnums = mockDataStr.match(enumPattern);

          matchEnums?.forEach((enumStr) => {
            mockDataStr = mockDataStr.replace(enumStr, enumStr.slice(1, -1));
          });

          code1.indent(`export const testCollections: TestCollection = {
            fields: ${mockDataStr}
            
        }
        `);

          code1.closeFile("testCollections.ts");
          this.outputDir = `editable_src/customMockLambdaLayer/mockData/${key}`;
          await code1.save(this.outputDir);
        }
      }
    } else {
      for (const key in this.config.api.mockApiData?.collections.fields) {
        const code = new CodeMaker();
        const ts = new TypeScriptWriter(code);

        if (key !== async_response_mutName) {
          if (new_config.api.mockApiData) {
            new_config.api.mockApiData.types[key].fields[
              key
            ] = `${JSON.stringify(
              new_config.api.mockApiData?.types[key].fields[key][0]
            )}[]`;
          }

          code.openFile("testCollectionsTypes.ts");
          const allTypes = new_config.api.mockApiData?.imports
            .filter(
              (val: string) =>
                val !==
                `Mutation${async_response_mutName
                  .charAt(0)
                  .toUpperCase()}${async_response_mutName.slice(1)}Args`
            )
            .map((val: string) => {
              return val
                .split("_")
                .reduce(
                  (
                    out_str: string,
                    val: string,
                    index: number,
                    arr: string[]
                  ) => {
                    return (out_str += `${transformStr(val)}${
                      arr.length > index + 1 ? "_" : ""
                    }`);
                  },
                  ""
                );
            });
          if (new_config.api.mockApiData?.imports) {
            ts.writeImports("../types", allTypes);
          }
          code.line();

          let returnType = new_config.api.mockApiData?.types[key];
          let data1 = returnType.fields[key].replace(/\\*/g, "");
          let data2 = JSON.parse(data1.substring(0, data1.length - 2));
          if (typeof data2["arguments"] === "string") {
            data2["arguments"] = data2["arguments"]
              .split("_")
              .reduce(
                (out_str: string, val: string, index: number, arr: string[]) => {
                  return (out_str += `${transformStr(val)}${
                    arr.length > index + 1 ? "_" : ""
                  }`);
                },
                ""
              );
          }
          if (typeof data2["response"] === "string") {
            if(data2["response"]==="ID"){
              data2["response"] = "String"
            }else{
              data2["response"] = data2["response"]
              .split("_")
              .reduce(
                (out_str: string, val: string, index: number, arr: string[]) => {
                  if (val.includes("|")) {
                    let commaStr = val
                      .split("|")
                      .reduce((outStr, val, index: number, arr: string[]) => {
                        val = val.replace(" ", "");
  
                        return (outStr += `${val
                          .charAt(0)
                          .toUpperCase()}${lodash.camelCase(val.slice(1))}${
                          arr.length > index + 1 ? "|" : ""
                        }`);
                      }, "");
                    return (out_str += commaStr);
                  }
                  if (val.includes("[]")) {
                    let commaStr = val
                      .split("[]")
                      .reduce((outStr, val, index: number, arr: string[]) => {
                        val = val.replace(" ", "");
  
                        return (outStr += `${val
                          .charAt(0)
                          .toUpperCase()}${lodash.camelCase(val.slice(1))}${
                          arr.length > index + 1 ? "[]" : ""
                        }`);
                      }, "");
                    return (out_str += commaStr);
                  }
                  return (out_str += `${val
                    .charAt(0)
                    .toUpperCase()}${lodash.camelCase(val.slice(1))}${
                    arr.length > index + 1 ? "_" : ""
                  }`);
                },
                ""
              );
            }

          }
          
          returnType.fields[key] =
            JSON.stringify(data2).replace(/"*\\*/g, "") + "[]";
          code.indent(`export type TestCollection =
            ${JSON.stringify(returnType).replace(/"*\\*/g, "")}
        `);
          code.closeFile("testCollectionsTypes.ts");
          await code.save(`editable_src/customMockLambdaLayer/mockData/${key}`);

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

          const enumPattern = /"[a-zA-Z_]+[.][a-zA-Z_]+"/g;
          let mockDataStr = `${JSON.stringify(
            { [key]: this.dummyData.fields[key] },
            null,
            2
          )}`;
          const matchEnums = mockDataStr.match(enumPattern);

          matchEnums?.forEach((enumStr) => {
            mockDataStr = mockDataStr.replace(enumStr, enumStr.slice(1, -1));
          });

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
