import { GraphQLSchema } from "graphql";
let upperFirst = require("lodash/upperFirst")

export const buildSchemaToJson = (gqlSchema: any) => {
  let includeDeprecatedFields = false;

  let collectionsObject: {
    fields: { [k: string]: [{ arguments: any; response: any }] };
  } = {
    fields: {},
  };

  let typeStr = "type TestCollection {\n fields {\n";

  const generateCollections = (obj: any, description: "Query" | "Mutation") => {
    Object.keys(obj).forEach((type: string) => {
      const field = gqlSchema.getType(description).getFields()[type];
      if (includeDeprecatedFields || !field.isDeprecated) {
        const field = gqlSchema.getType(description).getFields()[type];
        const responseTypeName = field.type.inspect().replace(/[[\]!]/g, "");
        const responseType = gqlSchema.getType(responseTypeName);
        collectionsObject.fields[type] = [{ arguments: {}, response: {} }];
        typeStr += `${type}: [{ arguments: ${description}${upperFirst(type)}Args; response: ${responseTypeName} }];\n`;
      }
      console.log(typeStr);
    });
    console.log(typeStr);
  };

  if (gqlSchema.getMutationType()) {
    generateCollections(gqlSchema?.getMutationType()?.getFields(), "Mutation");
  }

  if (gqlSchema.getQueryType()) {
    generateCollections(gqlSchema?.getQueryType()?.getFields(), "Query");
  }
  typeStr += "}\n}";

  console.log(typeStr);
};
