import {
    ApiModel,
  } from "../../../../utils/constants";
 
  import { CodeMaker } from "codemaker";
import { Imports } from "../../constructs/ConstructsImports";
 
  import {defineAspectController} from './aspectController'
import { defineConstructVisitor } from "./constructVisitor";

  type props = {
    config: ApiModel;
  };
  
  class createAspects {
    code: CodeMaker;
    stackName:string

    constructor(props: props) {
        this.code = new CodeMaker();
        this.stackName = props.config.workingDir;
    }
  
    async defineAspects() {


    this.code.openFile('index.ts');
     await defineAspectController(this.code)
     this.code.closeFile('index.ts');
     await this.code.save('custom_src/aspects');

     
    this.code.openFile('constructVisitor.ts');
     await defineConstructVisitor(this.code)
     this.code.closeFile('constructVisitor.ts');
     await this.code.save('custom_src/aspects');
    }
  }
  
  export const CreateAspects = async (
   props: props
  ): Promise<void> => {
    const builder = new createAspects(props);
    await builder.defineAspects();
  };
  