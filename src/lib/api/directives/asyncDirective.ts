import { async_response_mutName } from "../../../utils/constants";

export class AsyncDirective {
  constructor() {}

  public fieldSplitter(mutationFields: any) {
    const mutationNames = [...Object.keys(mutationFields)];
    let asyncFields: string[] = [];

    for (let mutationName of mutationNames) {
      if (mutationFields[mutationName].astNode.directives) {
        const asyncDirective = mutationFields[
          mutationName
        ].astNode.directives.find((val: any) => val.name.value === "async");

        if (asyncDirective) {
          asyncFields = [...asyncFields, mutationName];
        }
      }
    }

    return asyncFields;
  }

  public schemaAsyncResponseCreator(
    mutationFields: any,
    subscriptionFields: any,
    schema: any,
    asyncFields: string[]
  ) {
    let newSchema = schema;

    let subNames: string[] = subscriptionFields
      ? Object.keys(subscriptionFields)
      : [];

    if (asyncFields.length > 0) {
      if (!mutationFields[async_response_mutName]) {
        const mutRegex = /type[\s]+Mutation[\s]+{[a-zA-Z\(\)\s:!@\"\#\_]+}/g;

        const oldMut = newSchema.match(mutRegex);

        let updateMut = oldMut ? oldMut[0].split("}") : null;

        updateMut =
          updateMut &&
          updateMut[0].trim() +
            `\n${async_response_mutName}(input:String!):String!\n}`;

        if (updateMut) {
          newSchema = newSchema.replace(oldMut[0], updateMut);
        }
      }

      if (!subscriptionFields) {
        newSchema =
          newSchema +
          `\ntype Subscription {\n${async_response_mutName}: String!\n@aws_subscribe(mutations: ["${async_response_mutName}"])\n}`;
      }

      if (subscriptionFields && !subscriptionFields[async_response_mutName]) {
        const subRegex =
          /type[\s]+Subscription[\s]+{[a-zA-Z\(\)\s:!@\"\#\_[\]]+}/g;

        const oldSub = newSchema.match(subRegex);

        let updateSub = oldSub ? oldSub[0].split("}") : null;

        updateSub =
          updateSub &&
          updateSub[0].trim() +
            `\n${async_response_mutName}: String!\n@aws_subscribe(mutations: ["${async_response_mutName}"])\n}`;

        if (updateSub) {
          newSchema = newSchema.replace(oldSub[0], updateSub);
        }
        //  console.log(newSchema)
      }
    }

    if (asyncFields.length === 0) {
      if (mutationFields[async_response_mutName]) {
        // newSchema = schema.replace(`async_response(input:String!):String!`, '')

        // console.log(newSchema)

        //const mutRegex = /type[\s]+Mutation[\s]+{[a-zA-Z\(\)\s:!@\"\#\_]+}/g

        // const oldMut = schema.match(mutRegex)

        // const asyncRespRegex = new RegExp(`/${async_response_mutName}[\s\(]+[input\s:String!]+[\)\s\:]+[String !]+/g`)
        const asyncRespRegex =
          /async_response[\s\(]+[input\s:String!]+[\)\s\:]+[String !]+/g;

        const asyncRespMut = newSchema.match(asyncRespRegex);

        if (asyncRespMut) {
          newSchema = newSchema.replace(asyncRespMut[0], "");
        }

        // let updateMut = oldMut[0].split('}');

        // updateMut[0] = updateMut[0].replace(`async_response(input:String!):String!`, '')

        //  updateMut = updateMut.join('}')

        // newSchema = schema.replace(oldMut[0], newMut)

        // console.log(newSchema)
      }

      if (subNames.length === 1 && subNames[0] === async_response_mutName) {
        const subRegex =
          /type[\s]+Subscription[\s]+{[a-zA-Z\(\)\s:!@\"\#\_[\]]+}/g;

        const oldSub = newSchema.match(subRegex);

        if (oldSub) {
          newSchema = newSchema.replace(oldSub[0], "");
        }

        // console.log(newSchema)
      }

      if (subNames.length > 1 && subscriptionFields[async_response_mutName]) {
        // const subRegex = new RegExp (`/${async_response_mutName}[\s\:]+[String\ !\s]+[@aws_subscribe\s\(mutations\s:\s\[\s${async_response_mutName}\s]+[\] \)]+/g`)

        const subRegex =
          /async_response[\s\:]+[String\ !\s]+[@aws_subscribe\s\(mutations\s:\s\[\s]+"async_response"[\s+\]]+[\s+\)]+/g;

        const asyncRespSub = newSchema.match(subRegex);

        if (asyncRespSub) {
          newSchema = newSchema.replace(asyncRespSub[0], "");
        }
      }
    }

    return newSchema;
  }
}

export const asyncDirectiveFieldSplitter = (mutationFields: any): string[] => {
  const initClass = new AsyncDirective();
  return initClass.fieldSplitter(mutationFields);
};

export const asyncDirectiveResponseCreator = (
  mutationFields: any,
  subscriptionFields: any,
  schema: any,
  asyncFields: string[]
): string => {
  const initClass = new AsyncDirective();
  return initClass.schemaAsyncResponseCreator(
    mutationFields,
    subscriptionFields,
    schema,
    asyncFields
  );
};
