import { CodeMaker } from "codemaker";
import { ApiModel, APITYPE, ARCHITECTURE } from "../../../utils/constants";
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

  async LambdaFile() {
    console.log(this.config);
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
        for(let k=0;k<5;k++){
          console.log('::::::::::::::::::::::::::::::::')
        }
        console.log(key)
        for(let k=0;k<5;k++){
          console.log('::::::::::::::::::::::::::::::::')
        }
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
  await builder.LambdaFile();
};
