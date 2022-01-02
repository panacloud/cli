import { Config } from "@oclif/config";
import { GraphQLObjectType, GraphQLSchema, IntrospectionQuery } from "graphql";
import { ApiModel, nestedResolverFieldsAndLambda } from "../../utils/constants";

export const ScalarAndEnumKindFinder = (type: any): boolean | any => {
  switch (type.kind) {
    case "SCALAR":
      return false;
    case "ENUM":
      return false;
    case "INPUT_OBJECT":
      return false;
    default:
      return true;
  }
};

export const EliminateScalarTypes = (type: any): boolean | any => {
  switch (type.name) {
    case "Mutation":
      return false;
    case "Query":
      return false;
    case "Subscription":
      return false;
    case "AWSDate":
      return false;
    case "AWSTime":
      return false;
    case "AWSDateTime":
      return false;
    case "AWSTimestamp":
      return false;
    case "AWSJSON":
      return false;
    case "AWSURL":
      return false;
    case "AWSPhone":
      return false;
    case "AWSIPAddress":
      return false;
    case "BigInt":
      return false;
    case "Double":
      return false;
    case "AWSEmail":
      return false;
    case "__Schema":
      return false;
    case "__Type":
      return false;
    case "__Field":
      return false;
    case "__InputValue":
      return false;
    case "__EnumValue":
      return false;
    case "String":
      return false;
    case "Int":
      return false;
    case "ID":
      return false;
    case "Boolean":
      return false;
    case "__Directive":
      return false;
    default:
      return true;
  }
};

export const FieldsAndLambdaForNestedResolver = (
  model: ApiModel,
  gqlSchema: GraphQLSchema
): nestedResolverFieldsAndLambda => {
  const {
    api: { schema },
  } = model;
  let FieldsAndLambdas: nestedResolverFieldsAndLambda = {
    nestedResolverFields: {},
    nestedResolverLambdas: [],
  };
  (schema as any).__schema.types.forEach((allTypes: { name: string; }) => {
    if (EliminateScalarTypes(allTypes)) {
      if (ScalarAndEnumKindFinder(allTypes)) {
        const typeName = gqlSchema.getType(allTypes.name) as GraphQLObjectType;
        const fieldsInType = typeName.getFields();
        let fieldsArray: { fieldName: string; lambda: string }[] = [];
        for (const type in fieldsInType) {
          if (
            EliminateScalarTypes(
              gqlSchema.getType(
                fieldsInType[type].type.inspect().replace(/[[\]!]/g, "")
              )
            )
          ) {
            const typeNode = gqlSchema.getType(allTypes.name)?.astNode  
            const node = gqlSchema.getType(
              fieldsInType[type].type.inspect().replace(/[[\]!]/g, "")
            )?.astNode;
            const name = node?.name.value as string;
            if (node?.kind === "ObjectTypeDefinition" && typeNode?.kind === "ObjectTypeDefinition") {
              if (name && FieldsAndLambdas.nestedResolverLambdas.indexOf(name) === -1) {
                FieldsAndLambdas.nestedResolverLambdas.push(name);
              }
              if(name){
                fieldsArray.push({
                  fieldName: type,
                  lambda: name,
                });
                FieldsAndLambdas.nestedResolverFields[allTypes.name] = [
                  ...fieldsArray,
                ];  
              }
            }
          }
        }
      }
    }
  });
  return FieldsAndLambdas;
};
