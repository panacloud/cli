let upperFirst = require("lodash/upperFirst");
let startCase = require("lodash/startCase");
import {
  GraphQLFieldMap,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  IntrospectionQuery,
  isInterfaceType,
} from "graphql";
const fse = require("fs-extra");

export const buildSchemaToTypescript = (
  gqlSchema: GraphQLSchema,
  introspection: IntrospectionQuery
) => {
  let includeDeprecatedFields = false;

  let collectionsObject: {
    fields: { [k: string]: { arguments?: any; response: any }[] };
  } = {
    fields: {},
  };

  let allImports: string[] = [];
  let allEnumImports: string[] = [];
  let typeStrings = {};

  const generateCollections = (
    obj: GraphQLFieldMap<any, any>,
    description: "Query" | "Mutation"
  ) => {
    Object.keys(obj).forEach((type: string) => {
      let typeStr = {};
      
      const _field = gqlSchema.getType(description) as GraphQLObjectType;
      const field = _field.getFields()[type];

      if (includeDeprecatedFields || !field.isDeprecated) {
        let responseTypeName = field.type.inspect().replace(/[[\]!]/g, "");
        let res;
        if (responseTypeName === "String" || responseTypeName === "ID") {
          res = "";
        } else if (responseTypeName === "Int") {
          res = 0;
        } else if (isInterfaceType(gqlSchema.getType(responseTypeName))) {
          const implementedTypes = gqlSchema
            .getImplementations(
              gqlSchema.getType(responseTypeName) as GraphQLInterfaceType
            )
            .objects.map((v) => upperFirst(v.toString()));
          responseTypeName = implementedTypes.join(" | ");
        } else {
          res = {};
        }

        collectionsObject.fields[type] =
          field.args.length > 0
            ? [{ arguments: {}, response: res }]
            : [
                {
                  ...(isArray(field.type.toString())
                    ? // ...(field.type.inspect().includes("[") &&
                      // field.type.inspect().includes("]")
                      { response: [] }
                    : { response: {} }),
                },
              ];

        if (responseTypeName === "Int") {
          responseTypeName = "number";
        }

        let responseType = isArray(field.type.toString())
          ? // field.type.inspect().includes("[") &&
            //   field.type.inspect().includes("]")
            `${responseTypeName}[]`
          : `${responseTypeName}`;

        field.args.length > 0
          ? (typeStr = {
              fields: {
                [type]: [
                  {
                    arguments: `${description}${upperFirst(type)}Args`,
                    response: upperFirst(responseType),
                  },
                ],
              },
            })
          : (typeStr = {
              fields: {
                [type]: [{ arguments: {}, response: upperFirst(responseType) }],
              },
            });

        introspection.__schema.types.forEach((v) => {
          if (v.kind === "ENUM") {
            if (v.name !== "__TypeKind" && v.name !== "__DirectiveLocation") {
              if (v.name.includes("_")) {
                let enum_imp: string = startCase(v.name);
                enum_imp = enum_imp.split(" ").join("_");
                allEnumImports.push(enum_imp);
              } else {
                allEnumImports.push(upperFirst(v.name));
              }
            }
          }
        });

        // typeStr += "}\n}";

        typeStrings = { ...typeStrings, [type]: typeStr };

        if (
          (responseTypeName === "String" ||
            responseTypeName === "number" ||
            responseTypeName === "ID" ||
            responseTypeName === "Boolean") &&
          field.args.length !== 0
        ) {
          allImports.push(`${description}${upperFirst(type)}Args`);
        } else if (field.args.length > 0) {
          allImports.push(
            ...responseTypeName.split(" | ").map((v) => upperFirst(v))
          );
          allImports.push(`${description}${upperFirst(type)}Args`);
        } else {
          if (
            responseTypeName !== "String" &&
            responseTypeName !== "number" &&
            responseTypeName !== "ID" &&
            responseTypeName !== "Boolean"
          ) {
            allImports.push(
              ...responseTypeName.split(" | ").map((v) => upperFirst(v))
            );
          }
        }
        // }
      }
    });

  };

  if (gqlSchema.getMutationType()) {
    generateCollections(
      gqlSchema?.getMutationType()?.getFields() || {},
      "Mutation"
    );
  }

  if (gqlSchema.getQueryType()) {
    generateCollections(gqlSchema?.getQueryType()?.getFields() || {}, "Query");
  }

  // Remove Duplication from Imports array
  let imports: string[] = [...new Set(allImports)];
  let enumImports: string[] = [...new Set(allEnumImports)];

  return {
    collections: collectionsObject,
    types: typeStrings,
    imports: imports,
    enumImports: enumImports,
  };
};

function isArray(typeName: string) {
  return !!typeName.match(/[[a-zA-Z0-9]*]/g);
}
