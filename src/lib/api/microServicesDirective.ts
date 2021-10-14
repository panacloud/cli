


export class microServicesDirective {

  constructor() {
  }

  public fieldSplitter(queryFields: any, mutationFields: any): {
    generalFields: string[];
    microServiceFields: {
      [k: string]: any[];
    }
  } {

    const queryNames = [...Object.keys(queryFields)];
    const mutationNames = [...Object.keys(mutationFields)];

    let allGraphqlFieldNames = [...queryNames, ...mutationNames]
    let microServiceFields: { [k: string]: any[] } = {};
    let generalFields: string[] = [];

    for (let field of allGraphqlFieldNames) {
      if (queryFields[field]) {

        if (queryFields[field].astNode.directives) {
          const microServiceInfo = queryFields[field].astNode.directives.find((val: any) => val.name.value === 'microService')
          if (microServiceInfo) {


            const arg = microServiceInfo.arguments.find((val: any) => val.name.value === "name")
            const argValue = arg.value.value

            if (microServiceFields[argValue]) {
              microServiceFields[argValue].push(field)
            }
            else {
              microServiceFields[argValue] = []
              microServiceFields[argValue].push(field)
            }


          }

          else {
            generalFields.push(field)
          }

        }

        else {
          generalFields.push(field)
        }

      }



      if (mutationFields[field]) {

        if (mutationFields[field].astNode.directives) {
          const microServiceInfo = mutationFields[field].astNode.directives.find((val: any) => val.name.value === 'microService')
          if (microServiceInfo) {


            const arg = microServiceInfo.arguments.find((val: any) => val.name.value === "name")
            const argValue = arg.value.value

            if (microServiceFields[argValue]) {
              microServiceFields[argValue].push(field)
            }
            else {
              microServiceFields[argValue] = []
              microServiceFields[argValue].push(field)
            }


          }

          else {
            generalFields.push(field)
          }

        }

        else {
          generalFields.push(field)
        }

      }

    }


    return { generalFields, microServiceFields }
  }

}


export const microServicesDirectiveFieldSplitter = (
  queryFields: any, mutationFields: any): {
    generalFields: string[];
    microServiceFields: {
      [k: string]: any[];
    }
  } => {
  const initClass = new microServicesDirective();
  return initClass.fieldSplitter(queryFields, mutationFields);
};