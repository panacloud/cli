import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE } from "../../../utils/constants";
import { TypeScriptWriter } from "../../../utils/typescriptWriter";
import { Imports } from "../constructs/ConstructsImports";

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
        ts.writeAllImports('./appsyncCredentials.json','appsyncCredentials')
    
        ts.writeVariableDeclaration({
          name:"values",
          typeName:"string[]",
          initializer:"Object.values(Object.entries(appsyncCredentials)[0][1]);",
          export:false
        },'const')
        code.openBlock(`export class  AppsyncAPI`)
          code.line()
          code.line(`private static instance: AppsyncAPI;`)
          code.line(`public API_KEY:string = '';`)
          code.line(`public API_URL:string = '';`)
          code.line()
          code.line(`private static instance: AppsyncAPI;`)
          code.openBlock(`private constructor()`)
          code.line(`values.forEach((val:string)=>{`)
          code.line(`if(this.isValidURL(val)){`)
          code.line(`this.API_URL=val`)
          code.line(`}else{`)
          code.line(`this.API_KEY = val`)
          code.line(`}`)
          code.line(`})`)
          code.closeBlock()
          code.line()
          code.openBlock(`public static getInstance(): AppsyncAPI `)
          code.line(`if (!AppsyncAPI.instance) {`)
          code.line(`AppsyncAPI.instance = new AppsyncAPI();`)
          code.line(`}`)
          code.line()
          code.line(`return AppsyncAPI.instance;`)
          code.closeBlock()
          code.openBlock(`private isValidURL(str:string)`)
          ts.writeVariableDeclaration({
            name:"res",
            initializer:"str.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);",
            export:false,
            typeName:""
          },'const')
          code.line(`return (res !== null)`)
          code.closeBlock()
        code.closeBlock()
       
         
        code.line();

        code.closeFile(this.outputFile);
        this.outputDir = `tests/apiTests/`;
        await code.save(this.outputDir);
      
    }
  

  async TestFile() {
    const {
      api: {
        apiType,
        generalFields,
        microServiceFields,
        mutationFields,
        queiresFields,
        apiName,
      },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      for (let i = 0; i < generalFields!.length; i++) {
        const code = new CodeMaker();
        const imp = new Imports(code);
        const ts = new TypeScriptWriter(code);

        const key = generalFields![i];
        
        this.outputFile = `${key}.test.ts`;
        const isMutation = mutationFields?.includes(key);

        code.openFile(this.outputFile);
        ts.writeImports('chai',["expect"])
        ts.writeAllImports('supertest','supertest')
        ts.writeImports('../../lambdaLayer/mockApi/testCollections',["testCollections"])
    
        ts.writeVariableDeclaration({
          name:"request",
          typeName:"",
          initializer:"supertest(process.env.API_URL);",
          export:false
        },'const')
        ts.writeVariableDeclaration({
          name:"args",
          typeName:"",
          initializer:`testCollections.fields.${key}[0].arguments`,
          export:false
        },'const')
        ts.writeVariableDeclaration({
          name:"response",
          typeName:"",
          initializer:`testCollections.fields.${key}[0].response`,
          export:false
        },'const')
        ts.writeVariableDeclaration({
          name:`{${key}}`,
          typeName:"",
          initializer:`${isMutation?"require('./graphql/output/mutations')":"require('./graphql/output/queries')"}`,
          export:false
        },'const')
        
        
        ts.writeApiTests(key)
        code.line();

        code.closeFile(this.outputFile);
        this.outputDir = `tests/apiTests/`;
        await code.save(this.outputDir);
      }
    }
  }
}

export const apiTests = async (props: StackBuilderProps): Promise<void> => {
  const builder = new APITests(props);
  await builder.TestFile();
  await builder.AppSyncFile()
};
