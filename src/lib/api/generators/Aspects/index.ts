import {
    ApiModel,
  } from "../../../../utils/constants";
 
  import { CodeMaker } from "codemaker";
import { Imports } from "../../constructs/ConstructsImports";
 
  import {defineAspectController} from './aspectController'
import { defineDefaultVisitor } from "./defaultVisitor";

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


    this.code.openFile('AspectController.ts');
     await defineAspectController(this.code)
     this.code.closeFile('AspectController.ts');
     await this.code.save('editable_src/aspects');

     
    this.code.openFile('DefaultVisitor.ts');
     await defineDefaultVisitor(this.code)
     this.code.closeFile('DefaultVisitor.ts');
     await this.code.save('editable_src/aspects');
    }
  }
  
  export const CreateAspects = async (
   props: props
  ): Promise<void> => {
    const builder = new createAspects(props);
    await builder.defineAspects();
  };
  