


export class AsyncDirective {

    constructor() {
    }
  
    public fieldSplitter(mutationFields: any) {
     

        const mutationNames = [...Object.keys(mutationFields)];
        let asyncFields: string[] = [];


        for (let mutationName of mutationNames){
            
            if (mutationFields[mutationName].astNode.directives) {

                const asyncDirective = mutationFields[mutationName].astNode.directives.find((val: any) => val.name.value === 'async')

                if (asyncDirective){
                   asyncFields = [...asyncFields, mutationName]
                }



        }

    }

    return asyncFields

  
  }

}
  
  
  export const asyncDirectiveFieldSplitter = (
     mutationFields: any):string[] => {
    const initClass = new AsyncDirective();
    return initClass.fieldSplitter(mutationFields)

     }
  
