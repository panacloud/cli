import { GraphQLSchema, buildSchema, GraphQLObjectType, GraphQLField, GraphQLArgument } from "graphql";
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
  //   private graphQLSchema: GraphQLSchema;
  private queryMockObjects: QueryMockObject[] = [];
  constructor(schema: string) {
    super(buildSchema(schema));
    const queries = this.graphQLSchema?.getQueryType()?.getFields();
    Object.entries(queries!).forEach(([queryName, queryFieldObject]) => {
      const queryMockObject = new QueryMockObject(this.graphQLSchema, queryName, queryFieldObject);
      this.queryMockObjects.push(queryMockObject);
      //   console.log(key, ":RootMockObject");
    });
  }
  write(object: TestCollectionType): void {
    // object.fields = {};
    this.queryMockObjects.forEach((v) => {
      v.write(object);
    });
  }
}

class QueryMockObject extends MockObject {
  private queryName: string;
  private objectArgs: ObjectArgs[] = [];
  private objectResponses: ObjectResponses[] = [];
  // private queryFieldObject: GraphQLField<any, any, any>
  constructor(graphQLSchema: GraphQLSchema, queryName: string, queryFieldObject: GraphQLField<any, any, any>) {
    super(graphQLSchema);
    this.queryName = queryName;
    // this.queryFieldObject = queryFieldObject
    this.objectArgs.push(new QueryObjectArgs(graphQLSchema, queryFieldObject.args))
    this.objectResponses.push(new QueryObjectResponses(graphQLSchema, [queryFieldObject]))
  }

  write(object: TestCollectionType) {
    object.fields[this.queryName] = [{ response: {}, arguments: {} }];
    this.objectArgs.forEach((v) => {
      v.write(object.fields[this.queryName][0].arguments);
    });
    this.objectResponses.forEach((v) => {
      v.write(object.fields[this.queryName][0].response);
    });
  }

}

abstract class ObjectResponses extends MockObject {
  constructor(graphQLSchema: GraphQLSchema) {
    super(graphQLSchema);
    // this.objectArgs = fieldArgs;
  }
}
abstract class ObjectArgs extends MockObject {
  constructor(graphQLSchema: GraphQLSchema) {
    super(graphQLSchema);
    // this.objectArgs = fieldArgs;
  }
}

class QueryObjectResponses extends ObjectResponses {
  private objectResponses: Array<ObjectResponses> = [];
  constructor(graphQLSchema: GraphQLSchema, fieldResponses: GraphQLField<any, any, { [key: string]: any }>[]) {
    super(graphQLSchema);
    // this.fieldArgs = fieldArgs;

    fieldResponses.forEach((response) => {
      let type = response.type.toString();
      const _isArray = isArray(type);
      type = type.replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String

      if (type === "String") {
        this.objectResponses.push(new StringObjectResponses(graphQLSchema, response, _isArray));

      } else if (type === "Int") {
        this.objectResponses.push(new IntObjectResponses(graphQLSchema, response, _isArray));

      } else if (type === "ID") {
        this.objectResponses.push(new IdObjectResponses(graphQLSchema, response, _isArray));

      } else if (type === "Float") {
        this.objectResponses.push(new FloatObjectResponses(graphQLSchema, response, _isArray));

      } else if (type === "Boolean") {
        this.objectResponses.push(new BoolObjectResponses(graphQLSchema, response, _isArray));

      } else {
        this.objectResponses.push(new CustomObjectResponses(graphQLSchema, response, _isArray));
      }
    });

  }
  write(object: ArgAndResponseType['arguments']) {
    this.objectResponses.forEach((objectResponses) => {
      objectResponses.write(object)
    })
  }
}
class QueryObjectArgs extends ObjectArgs {
  private objectArgs: Array<ObjectArgs> = [];
  constructor(graphQLSchema: GraphQLSchema, fieldArgs: Array<GraphQLArgument>) {
    super(graphQLSchema);
    // this.fieldArgs = fieldArgs;

    fieldArgs.forEach((arg: GraphQLArgument) => {
      let type = arg.type.toString();
      const _isArray = isArray(type);
      type = type.replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
      // console.log(type)
      if (type === "String") {
        this.objectArgs.push(new StringObjectArgs(graphQLSchema, arg, _isArray));

      } else if (type === "Int") {
        this.objectArgs.push(new IntObjectArgs(graphQLSchema, arg, _isArray));

      } else if (type === "ID") {
        this.objectArgs.push(new IdObjectArgs(graphQLSchema, arg, _isArray));

      } else if (type === "Float") {
        this.objectArgs.push(new FloatObjectArgs(graphQLSchema, arg, _isArray));

      } else if (type === "Boolean") {
        this.objectArgs.push(new BoolObjectArgs(graphQLSchema, arg, _isArray));

      } else {
        this.objectArgs.push(new CustomObjectArgs(graphQLSchema, arg, _isArray));

      }
    });

  }
  write(object: ArgAndResponseType['arguments']) {
    this.objectArgs.forEach((objectArgs) => {
      objectArgs.write(object)
    })
  }
}

class StringObjectResponses extends ObjectResponses {
  private arg: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    // this.objectArgs = objectArgs;
    this.arg = arg;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.arg.name] = ["Hello1", "Hello2", "Hello3"];
    } else {
      object[this.arg.name] = "Hello";
    }
  }
}
class IntObjectResponses extends ObjectResponses {
  private arg: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.arg = arg;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.arg.name] = [0, 1, 2];
    } else {
      object[this.arg.name] = 0;
    }
  }
}
class IdObjectResponses extends ObjectResponses {
  private arg: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.arg = arg;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.arg.name] = ['01', '02', '03'];
    } else {
      object[this.arg.name] = '01';
    }
  }
}
class FloatObjectResponses extends ObjectResponses {
  private arg: GraphQLField<any, any, { [key: string]: any }>;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.arg = arg;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.arg.name] = [0.1, 0.2, 0.3];
    } else {
      object[this.arg.name] = 0.1;
    }
  }
}
class BoolObjectResponses extends ObjectResponses {
  private arg: GraphQLField<any, any, { [key: string]: any }>
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.arg = arg;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.arg.name] = [true, false, true];
    } else {
      object[this.arg.name] = true;
    }
  }
}
class CustomObjectResponses extends ObjectResponses {
  private response: GraphQLField<any, any, { [key: string]: any }>;
  private objectResponses: ObjectResponses[] = []
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, response: GraphQLField<any, any, { [key: string]: any }>, isArray: boolean) {
    super(graphQLSchema);
    this.response = response;
    this.isArray = isArray;
    const type = response.type.toString().replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
    const inputObjectType = this.graphQLSchema.getType(type) as GraphQLObjectType;
    const inputObjectFields = inputObjectType?.getFields() as any as { [key: string]: GraphQLField<any, any, { [key: string]: any }> };
    this.objectResponses.push(new QueryObjectResponses(graphQLSchema, Object.values(inputObjectFields)))
    // this.queryObjectArg = new QueryObjectArgs(graphQLSchema,)
  }

  write(object: ArgAndResponseType['response']): void {
    if (this.isArray) {
      object[this.response.name] = [{}, {}, {}];
      this.objectResponses.forEach((objectResponse) => {
        objectResponse.write(object[this.response.name][0])
        objectResponse.write(object[this.response.name][1])
        objectResponse.write(object[this.response.name][2])
      })
    } else {
      object[this.response.name] = {};
      this.objectResponses.forEach((objectResponse) => {
        objectResponse.write(object[this.response.name])
      })
    }
  }

}

class StringObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    // this.objectArgs = objectArgs;
    this.isArray = isArray;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.arg.name] = ["Hello1", "Hello2", "Hello3"];
    } else {
      object[this.arg.name] = "Hello";
    }
  }
}
class IntObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.arg.name] = [0, 1, 2];
    } else {
      object[this.arg.name] = 0;
    }
  }
}
class IdObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.arg = arg;
    this.isArray = isArray;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.arg.name] = ['01', '02', '03'];
    } else {
      object[this.arg.name] = '01';
    }
  }
}
class FloatObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.arg.name] = [0.1, 0.2, 0.3];
    } else {
      object[this.arg.name] = 0.1;
    }
  }
}
class BoolObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.arg.name] = [true, false, true];
    } else {
      object[this.arg.name] = true;
    }
  }
}
// class ArrayObjectArgs extends ObjectArgs {
//   private arg: GraphQLArgument;
//   constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument) {
//     super(graphQLSchema);
//     this.arg = arg;
//   }

//   write(object: ArgAndResponseType['arguments']): void {
//     if (object) {
//       object[this.arg.name] = false;
//     }
//   }
// }
class CustomObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  private objectArgs: ObjectArgs[] = []
  private isArray?: boolean;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument, isArray: boolean) {
    super(graphQLSchema);
    this.isArray = isArray;
    this.arg = arg;
    const type = arg.type.toString().replace(/[\[|\]!]/g, '') as ScalarType; //removing braces and "!" eg: [String!]! ==> String
    const inputObjectType = this.graphQLSchema.getType(type) as GraphQLObjectType;
    const inputObjectFields = inputObjectType?.getFields() as any as { [key: string]: GraphQLArgument };
    // if (isArray) {
    //   this.objectArgs.push(new QueryObjectArgs(graphQLSchema, Object.values(inputObjectFields)))
    //   this.objectArgs.push(new QueryObjectArgs(graphQLSchema, Object.values(inputObjectFields)))
    //   this.objectArgs.push(new QueryObjectArgs(graphQLSchema, Object.values(inputObjectFields)))
    // } else {
    //   this.objectArgs.push(new QueryObjectArgs(graphQLSchema, Object.values(inputObjectFields)))
    // }
    this.objectArgs.push(new QueryObjectArgs(graphQLSchema, Object.values(inputObjectFields)))
    // this.queryObjectArg = new QueryObjectArgs(graphQLSchema,)
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (this.isArray) {
      object[this.arg.name] = [{}, {}, {}];
      this.objectArgs.forEach((objectArg, idx) => {
        objectArg.write(object[this.arg.name][0])
        objectArg.write(object[this.arg.name][1])
        objectArg.write(object[this.arg.name][2])
      })
    } else {
      object[this.arg.name] = {};
      this.objectArgs.forEach((objectArg) => {
        objectArg.write(object[this.arg.name])
      })
    }
  }
}
