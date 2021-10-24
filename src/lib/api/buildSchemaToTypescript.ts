let upperFirst = require("lodash/upperFirst");

export const buildSchemaToTypescript = (gqlSchema: any, introspection: any) => {
  let includeDeprecatedFields = false;

  let collectionsObject: {
    fields: { [k: string]: { arguments?: any; response: any }[] };
  } = {
    fields: {},
  };

  let allImports: string[] = [];
  let allEnumImports: string[] = [];

  let typeStr = "type TestCollection = {\n fields: {\n";

  const generateCollections = (obj: any, description: "Query" | "Mutation") => {
    Object.keys(obj).forEach((type: string) => {
      const field = gqlSchema.getType(description).getFields()[type];
      if (includeDeprecatedFields || !field.isDeprecated) {
        const responseTypeName = field.type.inspect().replace(/[[\]!]/g, "");
        let res;
        if (responseTypeName === "String" || responseTypeName === "ID") {
          res = "";
        } else if (responseTypeName === "Int") {
          res = 0;
        } else {
          res = {};
        }

        collectionsObject.fields[type] =
          field.args.length > 0
            ? [{ arguments: {}, response: res }]
            : [
                {
                  ...(field.type.inspect().includes("[") &&
                  field.type.inspect().includes("]")
                    ? { response: [] }
                    : { response: {} }),
                },
              ];

        let responseType =
          field.type.inspect().includes("[") &&
          field.type.inspect().includes("]")
            ? `[${responseTypeName}]`
            : `${responseTypeName}`;

        field.args.length > 0
          ? (typeStr += `${type}: {arguments: ${description}${upperFirst(
              type
            )}Args; response: ${responseType} }[];\n`)
          : (typeStr += `${type}: { response: ${responseType} }[];\n`);

        introspection.__schema.types.forEach((v: any) => {
          if (v.kind === "ENUM") {
            if (v.name !== "__TypeKind" && v.name !== "__DirectiveLocation") {
              allEnumImports.push(v.name);
            }
          }
        });

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
          allImports.push(responseTypeName);
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
  let enumImports: string[] = [...new Set(allEnumImports)];

  return {
    collections: collectionsObject,
    types: typeStr,
    imports: imports,
    enumImports: enumImports,
  };
};
