import { CodeMaker } from "codemaker";
import {
  ApiModel,
  APITYPE,
  async_response_mutName,
  PanacloudconfigFile,
} from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { Imports } from "../../constructs/ConstructsImports";
import TestWriter from "./functions";
type StackBuilderProps = {
  config: ApiModel;
};

class APITests {
  outputFile: string = `index.test.ts`;
  config: ApiModel;
  outputDir: string = `tests`;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
  }
  async AppSyncFile() {
    const code = new CodeMaker();
    const ts = new TypeScriptWriter(code);
    this.outputFile = `AppSyncAPI.ts`;

    code.openFile(this.outputFile);
    ts.writeImports("fs-extra", ["existsSync", "readFileSync"]);
    ts.writeAllImports("valid-url", "validUrl");
    ts.writeVariableDeclaration(
      {
        name: "stage",
        initializer: `process.argv[process.argv.length-1]`,
        typeName: "",
        export: false,
      },
      "const"
    );
    code.openBlock("if(!existsSync(`./cdk-${stage}-outputs.json`))");
    code.line("console.log(`cdk-${stage}-outputs.json file not found.It seems your stack is not deployed.`)");
    code.line(`process.exit(1)`);
    code.closeBlock();
    ts.writeVariableDeclaration(
      {
        name: "appsyncCredentials",
        initializer: "JSON.parse(readFileSync(`./cdk-${stage}-outputs.json`).toString())",
        typeName: "",
        export: false,
      },
      "const"
    );

    ts.writeVariableDeclaration(
      {
        name: "values",
        typeName: "string[]",
        initializer:
          "Object.values(Object.entries(appsyncCredentials)[0][1] as any) ",
        export: false,
      },
      "const"
    );
    code.openBlock(`export class  AppsyncAPI`);
    code.line();
    code.line(`private static instance: AppsyncAPI;`);
    code.line(`public API_KEY:string = '';`);
    code.line(`public API_URL:string = '';`);
    code.line();
    code.openBlock(`private constructor()`);
    code.line(`values.forEach((val:string)=>{`);
    code.line(`if(validUrl.isUri(val)){`);
    code.line(`this.API_URL=val`);
    code.line(`}else{`);
    code.line(`this.API_KEY = val`);
    code.line(`}`);
    code.line(`})`);
    code.closeBlock();
    code.line();
    code.openBlock(`public static getInstance(): AppsyncAPI `);
    code.line(`if (!AppsyncAPI.instance) {`);
    code.line(`AppsyncAPI.instance = new AppsyncAPI();`);
    code.line(`}`);
    code.line();
    code.line(`return AppsyncAPI.instance;`);
    code.closeBlock();
    code.closeBlock();

    code.line();

    code.closeFile(this.outputFile);
    this.outputDir = `tests/apiTests/`;
    await code.save(this.outputDir);
  }

  async TestFile(panacloudConfig: PanacloudconfigFile) {
    const {
      api: { apiType, mutationFields },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      const code = new CodeMaker();
      const imp = new Imports(code);
      const ts = new TypeScriptWriter(code);
      const tw = new TestWriter(code);
      const mutationAndQueires = [
        ...this.config.api.mutationFields!,
        ...this.config.api.queiresFields!,
      ];

      mutationAndQueires?.forEach((key) => {
        this.outputFile = `${key}.test.ts`;

        const isMutation = mutationFields?.includes(key);

        if (key !== async_response_mutName) {
          code.openFile(this.outputFile);
          ts.writeImports("chai", ["expect"]);
          ts.writeAllImports("supertest", "supertest");
          ts.writeImports("./AppSyncAPI", ["AppsyncAPI"]);
          ts.writeImports(
            `../../${panacloudConfig.mockLambdaLayer!["asset_path"].replace(
              /^\/|\/$/g,
              ""
            )}/mockData/${key}/testCollections`,
            ["testCollections"]
          );
          ts.writeVariableDeclaration(
            {
              name: "{API_KEY,API_URL}",
              typeName: "",
              initializer: "AppsyncAPI.getInstance()",
              export: false,
            },
            "const"
          );
          ts.writeVariableDeclaration(
            {
              name: "request",
              typeName: "",
              initializer: "supertest(API_URL);",
              export: false,
            },
            "const"
          );
          // ts.writeVariableDeclaration(
          //   {
          //     name: "args",
          //     typeName: "",
          //     initializer: `testCollections.fields.${key}[0].arguments`,
          //     export: false,
          //   },
          //   "const"
          // );
          // ts.writeVariableDeclaration(
          //   {
          //     name: "response",
          //     typeName: "",
          //     initializer: `testCollections.fields.${key}[0].response`,
          //     export: false,
          //   },
          //   "const"
          // );
          ts.writeVariableDeclaration(
            {
              name: `{${key}}`,
              typeName: "",
              initializer: `${
                isMutation
                  ? "require('./graphql/mutations')"
                  : "require('./graphql/queries')"
              }`,
              export: false,
            },
            "const"
          );

          tw.writeApiTests(key, ts);
          code.line();

          code.closeFile(this.outputFile);
        }
      });

      this.outputDir = `tests/apiTests/`;
      await code.save(this.outputDir);
    }
  }
}

export const apiTests = async (
  props: StackBuilderProps,
  panacloudConfig: PanacloudconfigFile
): Promise<void> => {
  const builder = new APITests(props);
  await builder.TestFile(panacloudConfig);
  await builder.AppSyncFile();
};
