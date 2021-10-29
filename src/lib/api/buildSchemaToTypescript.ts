let upperFirst = require("lodash/upperFirst");
import { GraphQLFieldMap, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, isInterfaceType } from 'graphql';
const fse = require("fs-extra");

export const buildSchemaToTypescript = (gqlSchema: GraphQLSchema, introspection: any) => {
  let includeDeprecatedFields = false;

  let collectionsObject: {
    fields: { [k: string]: { arguments?: any; response: any }[] };
  } = {
    fields: {},
  };

  let allImports: string[] = [];
  let allEnumImports: string[] = [];
  let typeStrings: any = {};

  const generateCollections = (obj: GraphQLFieldMap<any, any>, description: "Query" | "Mutation") => {

    Object.keys(obj).forEach((type: string) => {
      let typeStr: any = {}
      // let typeStr = "type TestCollection = {\n fields: {\n";
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
          const implementedTypes = gqlSchema.getImplementations(gqlSchema.getType(responseTypeName) as GraphQLInterfaceType).objects.map(v => v.toString());
          responseTypeName = implementedTypes.join(' | ')
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
          ? typeStr = { "fields": { [type]: [{ arguments: `${description}${upperFirst(type)}Args`, response: responseType }] } }
          : typeStr = { "fields": { [type]: [{ response: responseType }] } }

        introspection.__schema.types.forEach((v: any) => {
          if (v.kind === "ENUM") {
            if (v.name !== "__TypeKind" && v.name !== "__DirectiveLocation") {
              allEnumImports.push(v.name);
            }
          }
        });

        // typeStr += "}\n}";

        typeStrings = { ...typeStrings, [type]: typeStr };

        if (
          (responseTypeName === "String" ||
            responseTypeName === "Int" ||
            responseTypeName === "ID") &&
          field.args.length !== 0
        ) {
          allImports.push(`${description}${upperFirst(type)}Args`);
        } else if (field.args.length > 0) {
          allImports.push(...(responseTypeName.split(' | ')));
          allImports.push(`${description}${upperFirst(type)}Args`);
        } else {
          allImports.push(...(responseTypeName.split(' | ')));
        }
      }
    });
  };

  if (gqlSchema.getMutationType()) {
    generateCollections(gqlSchema?.getMutationType()?.getFields() || {}, "Mutation");
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