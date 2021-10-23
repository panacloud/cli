import { GraphQLSchema, buildSchema, GraphQLObjectType, GraphQLField, GraphQLArgument, GraphQLEnumType } from "graphql";
import { isArray } from "./helper";
// import * as crypto from 'crypto';

type ScalarType = "Int" | "Float" | "ID" | "String" | "Boolean" | "Custom"
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

  constructor(schema: string) {
    super(buildSchema(schema));
    const queries = this.graphQLSchema?.getQueryType()?.getFields();
    const mutations = this.graphQLSchema?.getMutationType()?.getFields();
    Object.entries(queries || []).forEach(([queryName, queryFieldObject]) => {
      const queryMockObject = new QueryMockObject(this.graphQLSchema, queryName, queryFieldObject);
      this.queryMockObjects.push(queryMockObject);
    });

  }
  write(object: TestCollectionType) {
    this.queryMockObjects.forEach((v) => {
      v.write(object);
    });
  }
}

class QueryMockObject extends MockObject {
  private queryName: string;
  private objectRequests: ObjectRequest[] = [];
  private objectResponses: ObjectResponse[] = [];
  constructor(graphQLSchema: GraphQLSchema, queryName: string, queryFieldObject: GraphQLField<any, any, any>) {
    super(graphQLSchema);
    this.queryName = queryName;
    this.objectRequests.push(new RootObjectRequest(graphQLSchema, queryFieldObject.args))
    this.objectResponses.push(new RootObjectResponse(graphQLSchema, [queryFieldObject]))
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
  private objectResponses: Array<ObjectResponse> = [];
  constructor(graphQLSchema: GraphQLSchema, fieldResponses: GraphQLField<any, any, { [key: string]: any }>[]) {
    super(graphQLSchema);
    // this.fieldArgs = fieldArgs;

    fieldResponses.forEach((response) => {
      let type = response.type.toString();
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

      } else if (this.isEnum(type)) {
        this.objectResponses.push(new EnumObjectResponse(graphQLSchema, response, _isArray));

      } else {
        this.objectResponses.push(new CustomObjectResponse(graphQLSchema, response, _isArray));
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
  private objectRequests: Array<ObjectRequest> = [];
  constructor(graphQLSchema: GraphQLSchema, fieldRequests: Array<GraphQLArgument>) {
    super(graphQLSchema);
    // this.fieldArgs = fieldArgs;

    fieldRequests.forEach((request: GraphQLArgument) => {
      let type = request.type.toString();
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

      } else if (this.isEnum(type)) {
        this.objectRequests.push(new EnumObjectRequest(graphQLSchema, request, _isArray));

      } else {
        this.objectRequests.push(new CustomObjectRequest(graphQLSchema, request, _isArray));

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
      object[this.responseField.name] = ["Hello1", "Hello2", "Hello3"];
    } else {
      object[this.responseField.name] = "Hello";
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
class EnumObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>
  private isArray?: boolean;
  private enumList: string[];
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
    const enumType = responseField.type.toString().replace(/[\[|\]!]/g, ''); //removing braces and "!" eg: [String!]! ==> String
    const enumObjectType = this.graphQLSchema.getType(enumType) as GraphQLEnumType;
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
    return this.enumList[Math.floor(Math.random() * this.enumList.length)]
  }
}
class CustomObjectResponse extends ObjectResponse {
  private responseField: GraphQLField<any, any, { [key: string]: any }>;
  private objectResponses: ObjectResponse[] = []
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, responseField: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.responseField = responseField;
    this.isArray = isArray;
    const type = responseField.type.toString().replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
    const inputObjectType = this.graphQLSchema.getType(type) as GraphQLObjectType;
    const inputObjectFields = inputObjectType?.getFields() as any as { [key: string]: GraphQLField<any, any, { [key: string]: any }> };
    this.objectResponses.push(new RootObjectResponse(graphQLSchema, Object.values(inputObjectFields)))
  }

  write(object: ArgAndResponseType['response']): void {
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
      object[this.requestField.name] = ["Hello1", "Hello2", "Hello3"];
    } else {
      object[this.requestField.name] = "Hello";
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
class EnumObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument
  private isArray?: boolean;
  private enumList: string[];
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
    const enumType = requestField.type.toString().replace(/[\[|\]!]/g, ''); //removing braces and "!" eg: [String!]! ==> String
    const enumObjectType = this.graphQLSchema.getType(enumType) as GraphQLEnumType;
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
    return this.enumList[Math.floor(Math.random() * this.enumList.length)]
  }

}
class CustomObjectRequest extends ObjectRequest {
  private requestField: GraphQLArgument;
  private objectRequests: ObjectRequest[] = []
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, requestField: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.requestField = requestField;
    const type = requestField.type.toString().replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
    const inputObjectType = this.graphQLSchema.getType(type) as GraphQLObjectType;
    const inputObjectFields = inputObjectType?.getFields() as any as { [key: string]: GraphQLArgument };
    this.objectRequests.push(new RootObjectRequest(graphQLSchema, Object.values(inputObjectFields)))
  }

  write(object: ArgAndResponseType['arguments']): void {
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
