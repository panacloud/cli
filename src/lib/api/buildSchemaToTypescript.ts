let upperFirst = require("lodash/upperFirst");

export const buildSchemaToTypescript = (gqlSchema: any) => {
  let includeDeprecatedFields = false;

  let collectionsObject: {
    fields: { [k: string]: [{ arguments?: any; response: any }] };
  } = {
    fields: {},
  };

  let allImports: string[] = [];

  let typeStr = "type TestCollection = {\n fields: {\n";

  const generateCollections = (obj: any, description: "Query" | "Mutation") => {
    Object.keys(obj).forEach((type: string) => {
      const field = gqlSchema.getType(description).getFields()[type];
      if (includeDeprecatedFields || !field.isDeprecated) {
        const responseTypeName = field.type.inspect().replace(/[[\]!]/g, "");

        collectionsObject.fields[type] =
          field.args.length > 0
            ? [{ arguments: {}, response: {} }]
            : [{ response: {} }];

        field.args.length > 0
          ? (typeStr += `${type}: [{arguments: ${description}${upperFirst(
              type
            )}Args; response: ${responseTypeName} }];\n`)
          : `${type}: [{ response: ${responseTypeName} }];\n`;

        if (
          (responseTypeName === "String" ||
            responseTypeName === "Int" ||
            responseTypeName === "ID") &&
          field.args.length !== 0
        ) {
          allImports.push(`${description}${upperFirst(type)}Args`);
        } else if (field.args.length > 0) {
          allImports.push(responseTypeName);
          allImports.push(`${description}${upperFirst(type)}Args`);
        } else {
          return;
        }
      }
    });
  };

  if (gqlSchema.getMutationType()) {
    generateCollections(gqlSchema?.getMutationType()?.getFields(), "Mutation");
  }

  if (gqlSchema.getQueryType()) {
    generateCollections(gqlSchema?.getQueryType()?.getFields(), "Query");
  }

  typeStr += "}\n}";

  // Remove Duplication from Imports array
  let imports: string[] = [...new Set(allImports)];

  return {
    collections: collectionsObject,
    types: typeStr,
    imports: imports,
  };
};
