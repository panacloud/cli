import { GraphQLSchema, buildSchema, GraphQLObjectType, GraphQLField, GraphQLArgument, GraphQLEnumType, GraphQLInterfaceType, isInterfaceType } from "graphql";
import { getRandomItem, isArray } from "./helper";
import { camelCase } from 'lodash';
import * as randomName from 'random-name';

type ScalarType = "Int" | "Float" | "ID" | "String" | "Boolean" | "Custom" | "AWSURL" | "AWSTimestamp" | "AWSEmail" | "AWSDateTime" | "AWSTime"|"AWSJSON" | "AWSPhone" | "AWSIPAddress"

export type ArgAndResponseType = { arguments?: any; response: any }
export type TestCollectionType = {
  fields: { [k: string]: ArgAndResponseType[] };
};

abstract class MockObject {
  protected graphQLSchema: GraphQLSchema;
  constructor(graphQLSchema: GraphQLSchema) {
    this.graphQLSchema = graphQLSchema;
  }
  abstract write(object: object): void;
}

export class RootMockObject extends MockObject {
  private queryMockObjects: QueryMockObject[] = [];
  private mutationMockObjects: MutationMockObject[] = [];
  constructor(schema: GraphQLSchema) {
    super(schema);
    const queries = this.graphQLSchema?.getQueryType()?.getFields();
    const mutations = this.graphQLSchema?.getMutationType()?.getFields();
    Object.entries(queries || []).forEach(([queryName, queryFieldObject]) => {
      const queryMockObject = new QueryMockObject(this.graphQLSchema, queryName, queryFieldObject);
      this.queryMockObjects.push(queryMockObject);
    });
    Object.entries(mutations || []).forEach(([mutationName, mutationFieldObject]) => {
      const mutationMockObject = new MutationMockObject(this.graphQLSchema, mutationName, mutationFieldObject);
      this.mutationMockObjects.push(mutationMockObject);
    });
  }
  write(object: TestCollectionType) {
    this.queryMockObjects.forEach((v) => {
      v.write(object);
    });
    this.mutationMockObjects.forEach((v) => {
      v.write(object);
    });
  }
}

class QueryMockObject extends MockObject {
  private queryName: string;
  private objectRequests: ObjectRequest[] = [];
  private objectResponses: ObjectResponse[] = [];
  constructor(graphQLSchema: GraphQLSchema, queryName: string, queryFieldObject: GraphQLField<any, any, any>,) {
    super(graphQLSchema);
    this.queryName = queryName;
    this.objectRequests.push(new RootObjectRequest(graphQLSchema, queryFieldObject.args, 0))
    this.objectResponses.push(new RootObjectResponse(graphQLSchema, [queryFieldObject], 0))
  }

  write(object: TestCollectionType) {
    object.fields[this.queryName] = [{ arguments: {}, response: {} }];
    this.objectRequests.forEach((v) => {
      v.write(object.fields[this.queryName][0].arguments);
    });
    this.objectResponses.forEach((v) => {
      v.write(object.fields[this.queryName][0].response);
    });
    object.fields[this.queryName][0].response =
      Object.values(object.fields[this.queryName][0].response)[0]
  }

}

class MutationMockObject extends MockObject {
  private mutationName: string;
  private objectRequests: ObjectRequest[] = [];
  private objectResponses: ObjectResponse[] = [];
  constructor(graphQLSchema: GraphQLSchema, mutationName: string, mutationFieldObject: GraphQLField<any, any, any>) {
    super(graphQLSchema);
    this.mutationName = mutationName;
    this.objectRequests.push(new RootObjectRequest(graphQLSchema, mutationFieldObject.args, 0))
    this.objectResponses.push(new RootObjectResponse(graphQLSchema, [mutationFieldObject], 0))
  }

  write(object: TestCollectionType) {
    object.fields[this.mutationName] = [{ arguments: {}, response: {} }];
    this.objectRequests.forEach((v) => {
      v.write(object.fields[this.mutationName][0].arguments);
    });
    this.objectResponses.forEach((v) => {
      v.write(object.fields[this.mutationName][0].response);
    });
    object.fields[this.mutationName][0].response =
      Object.values(object.fields[this.mutationName][0].response)[0]
  }

}

abstract class ObjectResponse extends MockObject {
  constructor(graphQLSchema: GraphQLSchema) {
    super(graphQLSchema);
    // this.objectArgs = fieldArgs;
  }
}
abstract class ObjectRequest extends MockObject {
  constructor(graphQLSchema: GraphQLSchema) {
    super(graphQLSchema);
    // this.objectArgs = fieldArgs;
  }
}

class RootObjectResponse extends ObjectResponse {
  private resolvedCustomObjectTypes: string[] = [];
  private objectResponses: Array<ObjectResponse> = [];
  private childNumber: number
  constructor(graphQLSchema: GraphQLSchema, fieldResponses: Array<GraphQLField<any, any, { [key: string]: any }>>, childNumber: number, resolvedCustomObjectTypes?: string[]) {
    super(graphQLSchema);
    this.resolvedCustomObjectTypes = resolvedCustomObjectTypes || [];
    this.childNumber = childNumber + 1;

    fieldResponses.forEach((response) => {
      let type = response.type.toString() as ScalarType;
      const _isArray = isArray(type);
      type = type.replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String

      if (type === "String") {
        this.objectResponses.push(new StringObjectResponse(graphQLSchema, response, _isArray));

      } else if (type === "Int") {
        this.objectResponses.push(new IntObjectResponse(graphQLSchema, response, _isArray));

      } else if (type === "ID") {
        this.objectResponses.push(new IdObjectResponse(graphQLSchema, response, _isArray));

      } else if (type === "Float") {
        this.objectResponses.push(new FloatObjectResponse(graphQLSchema, response, _isArray));

      } else if (type === "Boolean") {
        this.objectResponses.push(new BoolObjectResponse(graphQLSchema, response, _isArray));

      } else if (type === "AWSTimestamp") {
        this.objectResponses.push(new AWSTimeStampObjectResponse(graphQLSchema, response, _isArray));

      } else if (type === "AWSEmail") {
        this.objectResponses.push(new AWSEmailObjectResponse(graphQLSchema, response, _isArray));

      } else if (type === "AWSURL") {
        this.objectResponses.push(new AWSURLObjectResponse(graphQLSchema, response, _isArray));

      } else if (this.isEnum(type)) {
        this.objectResponses.push(new EnumObjectResponse(graphQLSchema, response, _isArray));

        /* if the field type is nested and come to resolve again */
      } else if (this.resolvedCustomObjectTypes.includes(type)) {
        // } else if (this.resolvedCustomObjectTypes.filter(item => item === type).length > 1) {
        this.objectResponses.push(new NestedCustomObjectResponse(graphQLSchema, response, _isArray));

        /* if the field type is interface*/
      } else if (isInterfaceType(this.graphQLSchema.getType(type))) {
        this.objectResponses.push(new CustomInterfaceObjectResponse(graphQLSchema, response, _isArray, this.childNumber, this.childNumber === 1 ? [] : this.resolvedCustomObjectTypes));

      } else {
        this.objectResponses.push(new CustomObjectResponse(graphQLSchema, response, _isArray, this.childNumber, this.childNumber === 1 ? [] : this.resolvedCustomObjectTypes));
      }
    });

  }
  write(object: ArgAndResponseType['arguments']) {
    this.objectResponses.forEach((objectResponse) => {
      objectResponse.write(object)
    })
  }
  isEnum(typeName: string) {
    return this.graphQLSchema.getType(typeName)?.astNode?.kind === "EnumTypeDefinition"
  }
}
class RootObjectRequest extends ObjectRequest {
  private resolvedCustomObjectTypes: string[] = [];
  private objectRequests: Array<ObjectRequest> = [];
  private childNumber: number
  constructor(graphQLSchema: GraphQLSchema, fieldRequests: Array<GraphQLArgument>, childNumber: number, resolvedCustomObjectTypes?: string[]) {
    super(graphQLSchema);
    this.resolvedCustomObjectTypes = resolvedCustomObjectTypes || [];
    this.childNumber = childNumber + 1;
    // console.log("childNumber", this.childNumber)

    fieldRequests.forEach((request: GraphQLArgument) => {
      let type = request.type.toString() as ScalarType;
      const _isArray = isArray(type);
      type = type.replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
      // console.log(type)
      if (type === "String") {
        this.objectRequests.push(new StringObjectRequest(graphQLSchema, request, _isArray));

      } else if (type === "Int") {
        this.objectRequests.push(new IntObjectRequest(graphQLSchema, request, _isArray));

      } else if (type === "ID") {
        this.objectRequests.push(new IdObjectRequest(graphQLSchema, request, _isArray));

      } else if (type === "Float") {
        this.objectRequests.push(new FloatObjectRequest(graphQLSchema, request, _isArray));

      } else if (type === "Boolean") {
        this.objectRequests.push(new BoolObjectRequest(graphQLSchema, request, _isArray));

      } else if (type === "AWSTimestamp") {
        this.objectRequests.push(new AWSTimeStampObjectRequest(graphQLSchema, request, _isArray));

      } else if (type === "AWSEmail") {
        this.objectRequests.push(new AWSEmailStampObjectRequest(graphQLSchema, request, _isArray));

      } else if (type === "AWSURL") {
        this.objectRequests.push(new AWSURLObjectRequest(graphQLSchema, request, _isArray));

      } else if (this.isEnum(type)) {
        this.objectRequests.push(new EnumObjectRequest(graphQLSchema, request, _isArray));

        /* if the field type is nested and come to resolve again */
      } else if (this.resolvedCustomObjectTypes.filter(item => item === type).length > 1) {
        this.objectRequests.push(new NestedCustomObjectRequest(graphQLSchema, request, _isArray));

      } else {
        this.objectRequests.push(new CustomObjectRequest(graphQLSchema, request, _isArray, this.childNumber, this.childNumber === 1 ? [] : this.resolvedCustomObjectTypes));

      }
    });

  }
  write(object: ArgAndResponseType['arguments']) {
    this.objectRequests.forEach((objectRequest) => {
      objectRequest.write(object)
    })
  }
  isEnum(typeName: string) {
    return this.graphQLSchema.getType(typeName)?.astNode?.kind === "EnumTypeDefinition"
  }
}

class StringObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    // this.objectArgs = objectArgs;
    this.responseField = responseField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = [randomName.first(), randomName.last(), randomName.first()];
    } else {
      object[this.responseField.name] = randomName.first();
    }
  }

}
class IntObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = [0, 1, 2];
    } else {
      object[this.responseField.name] = 0;
    }
  }
}
class IdObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = ['01', '02', '03'];
    } else {
      object[this.responseField.name] = '01';
    }
  }
}
class FloatObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = [0.1, 0.2, 0.3];
    } else {
      object[this.responseField.name] = 0.1;
    }
  }
}
class BoolObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = [true, false, true];
    } else {
      object[this.responseField.name] = true;
    }
  }
}
class AWSURLObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = ["https://google.com", "https://facebook.com", "https://linkedin.com"];
    } else {
      object[this.responseField.name] = "https://google.com";
    }
  }
}
class AWSTimeStampObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = [1635081727478, 1635081727478, 1635081727478];
    } else {
      object[this.responseField.name] = 1635081727478;
    }
  }
}
class AWSEmailObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = [`${randomName.first()}@hotmail.com`, `${randomName.first()}@gmail.com`, `${randomName.first()}@yahoo.com`];
    } else {
      object[this.responseField.name] = `${randomName.first()}@gmail.com`;
    }
  }
}
class EnumObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>
  private isArray?: boolean;
  private enumType: string;
  private enumList: string[];
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
    this.enumType = responseField.type.toString().replace(/[\[|\]!]/g, ''); //removing braces and "!" eg: [String!]! ==> String
    const enumObjectType = this.graphQLSchema.getType(this.enumType) as GraphQLEnumType;
    this.enumList = enumObjectType.getValues().map(v => v.name);
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.responseField.name] = [this.getRandomEnum(), this.getRandomEnum(), this.getRandomEnum()];
    } else {
      object[this.responseField.name] = this.getRandomEnum();
    }
  }
  getRandomEnum() {
    const enumValue = getRandomItem(this.enumList);
    return `${this.enumType}.${enumValue[0].toUpperCase()}${camelCase(enumValue).slice(1)}`; // ==> ApiSaasType.Music
  }
}
class NestedCustomObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.responseField = responseField;
  }
  write(object: ArgAndResponseType['response']) {
    if (this.isArray) {
      object[this.responseField.name] = [];
    } else {
      object[this.responseField.name] = undefined;
    }
  }
}
class CustomInterfaceObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>;
  private objectResponses: { objectResponse: ObjectResponse, objectType: GraphQLObjectType<any, any> }[] = [];
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean, childNumber: number, resolvedCustomObjectTypes?: string[]) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
    const type = responseField.type.toString().replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
    resolvedCustomObjectTypes?.push(type);
    const interfaceTypeObject = this.graphQLSchema.getType(type) as GraphQLInterfaceType;
    const implementedObjectTypes = [...this.graphQLSchema.getImplementations(interfaceTypeObject).objects];

    if (isArray) {
      Array(3).fill(null).forEach(() => {
        const objectType = getRandomItem(implementedObjectTypes);
        const objectFields = objectType?.getFields() as any as { [key: string]: GraphQLField<any, any, { [key: string]: any }> };
        this.objectResponses.push({
          objectResponse: new RootObjectResponse(graphQLSchema, Object.values(objectFields), childNumber, resolvedCustomObjectTypes),
          objectType: objectType
        })
      })
    } else {
      const objectType = getRandomItem(implementedObjectTypes);
      const objectFields = objectType?.getFields() as any as { [key: string]: GraphQLField<any, any, { [key: string]: any }> };
      this.objectResponses.push({
        objectResponse: new RootObjectResponse(graphQLSchema, Object.values(objectFields), childNumber, resolvedCustomObjectTypes),
        objectType: objectType
      })
    }

  }

  write(object: ArgAndResponseType['response']) {
    if (this.isArray) {
      object[this.responseField.name] = [];
      this.objectResponses.forEach(({ objectResponse, objectType }, idx) => {
        object[this.responseField.name].push({ __typename: objectType.name })
        objectResponse.write(object[this.responseField.name][idx])
      })

    } else {
      this.objectResponses.forEach(({ objectResponse, objectType }) => {
        object[this.responseField.name] = { __typename: objectType.name };
        objectResponse.write(object[this.responseField.name])
      })
    }

  }

}
class CustomObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>;
  private objectResponses: ObjectResponse[] = []
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean, childNumber: number, resolvedCustomObjectTypes?: string[]) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
    const type = responseField.type.toString().replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
    resolvedCustomObjectTypes?.push(type);
    const objectType = this.graphQLSchema.getType(type) as GraphQLObjectType;
    const objectFields = objectType?.getFields() as any as { [key: string]: GraphQLField<any, any, { [key: string]: any }> };
    this.objectResponses.push(new RootObjectResponse(graphQLSchema, Object.values(objectFields), childNumber, resolvedCustomObjectTypes))
  }

  write(object: ArgAndResponseType['response']) {
    if (this.isArray) {
      object[this.responseField.name] = [{}, {}, {}];
      this.objectResponses.forEach((objectResponse) => {
        objectResponse.write(object[this.responseField.name][0])
        objectResponse.write(object[this.responseField.name][1])
        objectResponse.write(object[this.responseField.name][2])
      })

    } else {
      object[this.responseField.name] = {};
      this.objectResponses.forEach((objectResponse) => {
        objectResponse.write(object[this.responseField.name])
      })
    }

  }

}


class StringObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = [randomName.first(), randomName.last(), randomName.first()];
    } else {
      object[this.requestField.name] = randomName.first();
    }
  }
}
class IntObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = [0, 1, 2];
    } else {
      object[this.requestField.name] = 0;
    }
  }
}
class IdObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.requestField = requestField;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = ['01', '02', '03'];
    } else {
      object[this.requestField.name] = '01';
    }
  }
}
class FloatObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = [0.1, 0.2, 0.3];
    } else {
      object[this.requestField.name] = 0.1;
    }
  }
}
class BoolObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = [true, false, true];
    } else {
      object[this.requestField.name] = true;
    }
  }
}
class AWSURLObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = ["https://google.com", "https://facebook.com", "https://linkedin.com"];
    } else {
      object[this.requestField.name] = "https://google.com";
    }
  }
}
class AWSTimeStampObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = [1635081727478, 1635081727478, 1635081727478];
    } else {
      object[this.requestField.name] = 1635081727478;
    }
  }
}
class AWSEmailStampObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = [`${randomName.first()}@hotmail.com`, `${randomName.first()}@gmail.com`, `${randomName.first()}@yahoo.com`];
    } else {
      object[this.requestField.name] = `${randomName.first()}@gmail.com`;
    }
  }
}
class EnumObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument
  private isArray?: boolean;
  private enumList: string[];
  private enumType: string;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
    this.enumType = requestField.type.toString().replace(/[\[|\]!]/g, ''); //removing braces and "!" eg: [String!]! ==> String
    const enumObjectType = this.graphQLSchema.getType(this.enumType) as GraphQLEnumType;
    this.enumList = enumObjectType.getValues().map(v => v.name);
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.requestField.name] = [this.getRandomEnum(), this.getRandomEnum(), this.getRandomEnum()];
    } else {
      object[this.requestField.name] = this.getRandomEnum();
    }
  }

  getRandomEnum() {
    const enumValue = getRandomItem(this.enumList);
    return `${this.enumType}.${enumValue[0].toUpperCase()}${camelCase(enumValue).slice(1)}`;
  }

}
class NestedCustomObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
  }
  write(object: ArgAndResponseType['arguments']) {
    if (this.isArray) {
      object[this.requestField.name] = [];
    } else {
      object[this.requestField.name] = undefined;
    }
  }
}
class CustomObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument;
  private objectRequests: ObjectRequest[] = []
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean, childNumber: number, resolvedCustomObjectTypes?: string[]) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
    const type = requestField.type.toString().replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
    resolvedCustomObjectTypes?.push(type)
    const inputObjectType = this.graphQLSchema.getType(type) as GraphQLObjectType;
    const inputObjectFields = inputObjectType?.getFields() as any as { [key: string]: GraphQLArgument };
    // console.log(this.resolvedCustomeObjectType);

    this.objectRequests.push(new RootObjectRequest(graphQLSchema, Object.values(inputObjectFields), childNumber, resolvedCustomObjectTypes))
  }

  write(object: ArgAndResponseType['arguments']) {
    if (this.isArray) {
      object[this.requestField.name] = [{}, {}, {}];
      this.objectRequests.forEach((objectRequest, idx) => {
        objectRequest.write(object[this.requestField.name][0])
        objectRequest.write(object[this.requestField.name][1])
        objectRequest.write(object[this.requestField.name][2])
      })
    } else {
      object[this.requestField.name] = {};
      this.objectRequests.forEach((objectRequest) => {
        objectRequest.write(object[this.requestField.name])
      })
    }
  }
}


