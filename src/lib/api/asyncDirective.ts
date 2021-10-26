


export class AsyncDirective {

    constructor() {
    }

    public fieldSplitter(mutationFields: any) {


        const mutationNames = [...Object.keys(mutationFields)];
        let asyncFields: string[] = [];


        for (let mutationName of mutationNames) {

            if (mutationFields[mutationName].astNode.directives) {

                const asyncDirective = mutationFields[mutationName].astNode.directives.find((val: any) => val.name.value === 'async')

                if (asyncDirective) {
                    asyncFields = [...asyncFields, mutationName]
                }



            }

        }

        return asyncFields


    }

    public schemaAsyncResponseCreator(mutationFields: any, subscriptionFields: any, schema: any, asyncFields: string[]) {

        let newSchema = schema;

        let subNames:string [] = subscriptionFields? Object.keys(subscriptionFields) : []

        if (asyncFields.length > 0){
        if (!mutationFields['async_response']) {


            const mutRegex = /type[\s]+Mutation[\s]+{[a-zA-Z\(\)\s:!@\"\#\_]+}/g

            const oldMut = newSchema.match(mutRegex)


            let updateMut = oldMut[0].split('}');

            updateMut = updateMut[0].trim() + `\nasync_response(input:String!):String!\n}`


            newSchema = newSchema.replace(oldMut[0], updateMut)



        }

        if (!subscriptionFields) {


            newSchema = newSchema + `\ntype Subscription {\nasync_response: String!\n@aws_subscribe(mutations: [async_response])\n}`


        }


        if (subscriptionFields && !subscriptionFields['async_response']){


            const subRegex = /type[\s]+Subscription[\s]+{[a-zA-Z\(\)\s:!@\"\#\_[\]]+}/g

            const oldSub = newSchema.match(subRegex)


            let updateSub = oldSub[0].split('}');

            updateSub = updateSub[0].trim() + `\nasync_response: String!\n@aws_subscribe(mutations: [async_response])\n}`


            newSchema = newSchema.replace(oldSub[0], updateSub)
          //  console.log(newSchema)


        }

        

    }



    if (asyncFields.length === 0){



        if (mutationFields['async_response']) {

            // newSchema = schema.replace(`async_response(input:String!):String!`, '')

            // console.log(newSchema)


            //const mutRegex = /type[\s]+Mutation[\s]+{[a-zA-Z\(\)\s:!@\"\#\_]+}/g

           // const oldMut = schema.match(mutRegex)


            const asyncRespRegex = /async_response[\s\(]+[input\s:String!]+[\)\s\:]+[String !]+/g

            const asyncRespMut = newSchema.match(asyncRespRegex)


         newSchema = newSchema.replace(asyncRespMut[0],'')


            // let updateMut = oldMut[0].split('}');



            // updateMut[0] = updateMut[0].replace(`async_response(input:String!):String!`, '')


            //  updateMut = updateMut.join('}')

           // newSchema = schema.replace(oldMut[0], newMut)

           // console.log(newSchema)

        }

        if (subNames.length === 1 && subNames[0] === "async_response"){

            const subRegex = /type[\s]+Subscription[\s]+{[a-zA-Z\(\)\s:!@\"\#\_[\]]+}/g

            const oldSub = newSchema.match(subRegex)

            newSchema = newSchema.replace(oldSub[0], "")

           // console.log(newSchema)

        }



        if (subNames.length > 1 && subscriptionFields['async_response']){

            console.log('hello')

            const subRegex = /async_response[\s\:]+[String\ !\s]+[@aws_subscribe\s\(mutations\s:\s\[\sasync_response\s]+[\] \)]+/g
            
            const asyncRespSub = newSchema.match(subRegex)


         newSchema = newSchema.replace(asyncRespSub[0],'')

        }


    }



    console.log(newSchema)


        return newSchema


    }

}


export const asyncDirectiveFieldSplitter = (
    mutationFields: any): string[] => {
    const initClass = new AsyncDirective();
    return initClass.fieldSplitter(mutationFields)

}

export const asyncDirectiveResponseCreator= (
    mutationFields: any, subscriptionFields: any, schema: any, asyncFields: string[]): string => {
    const initClass = new AsyncDirective();
    return initClass.schemaAsyncResponseCreator(mutationFields,subscriptionFields, schema, asyncFields)

}



