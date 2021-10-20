import { GraphQLSchema, buildSchema, GraphQLObjectType, GraphQLField, GraphQLArgument } from "graphql";
import * as crypto from 'crypto';

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
  // private objectResponses: ObjectResponses[] = [];
  private queryFieldObject: GraphQLField<any, any, any>
  constructor(graphQLSchema: GraphQLSchema, queryName: string, queryFieldObject: GraphQLField<any, any, any>) {
    super(graphQLSchema);
    this.queryName = queryName;
    this.queryFieldObject = queryFieldObject
    this.objectArgs.push(new QueryObjectArgs(graphQLSchema, queryFieldObject.args))
  }

  write(object: TestCollectionType) {
    object.fields[this.queryName] = [{ response: {}, arguments: {} }];
    this.objectArgs.forEach((v) => {
      v.write(object.fields[this.queryName][0].arguments);
    });
    // this.objectResponses.forEach((v) => {
    //   v.write(object.fields[this.queryName][0].arguments);
    // });
  }

}

abstract class ObjectArgs extends MockObject {
  constructor(graphQLSchema: GraphQLSchema) {
    super(graphQLSchema);
    // this.objectArgs = fieldArgs;
  }
}

class QueryObjectArgs extends ObjectArgs {
  private objectArgs: Array<ObjectArgs> = [];
  constructor(graphQLSchema: GraphQLSchema, fieldArgs: Array<GraphQLArgument>) {
    super(graphQLSchema);
    // this.fieldArgs = fieldArgs;

    fieldArgs.forEach((arg: GraphQLArgument) => {
      if (arg.type.toString() === "String") {
        this.objectArgs.push(
          new StringObjectArgs(graphQLSchema, arg)
        );
      } else if (arg.type.toString() === "Int") {
        this.objectArgs.push(
          new IntObjectArgs(graphQLSchema, arg)
        );
      } else if (arg.type.toString() === "ID") {
        this.objectArgs.push(
          new IdObjectArgs(graphQLSchema, arg)
        );
      } else if (arg.type.toString() === "Float") {
        this.objectArgs.push(
          new FloatObjectArgs(graphQLSchema, arg)
        );
      } else if (arg.type.toString() === "Boolean") {
        this.objectArgs.push(
          new BoolObjectArgs(graphQLSchema, arg)
        );
      } else {
        this.objectArgs.push(
          new CustomObjectArgs(graphQLSchema, arg)
        );
      }
    });

  }
  write(object: ArgAndResponseType['arguments']) {
    this.objectArgs.forEach((objectArgs) => {
      objectArgs.write(object)
    })
  }
}

class StringObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument) {
    super(graphQLSchema);
    // this.objectArgs = objectArgs;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = "Hello";
    }
  }
}
class IntObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument) {
    super(graphQLSchema);
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = 0;
    }
    // object.fields[this.fieldObject.name][0].arguments[this.arg.name] = 0;
  }
}
class IdObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument) {
    super(graphQLSchema);
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = "01";
    }
  }
}
class FloatObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument) {
    super(graphQLSchema);
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = 0.1;
    }
  }
}
class BoolObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument) {
    super(graphQLSchema);
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = false;
    }
  }
}
class CustomObjectArgs extends ObjectArgs {
  private arg: GraphQLArgument;
  private objectArgs: ObjectArgs[] = []
  constructor(graphQLSchema: GraphQLSchema, arg: GraphQLArgument) {
    super(graphQLSchema);
    this.arg = arg;
    console.log(arg.type.toString())
    const inputObjectType = this.graphQLSchema.getType(arg.type.toString()) as GraphQLObjectType;
    const inputObjectFields = inputObjectType?.getFields() as any as { [key: string]: GraphQLArgument };
    this.objectArgs.push(new QueryObjectArgs(graphQLSchema, Object.values(inputObjectFields)))
    // this.queryObjectArg = new QueryObjectArgs(graphQLSchema,)
  }

  write(object: ArgAndResponseType['arguments']): void {
    object[this.arg.name] = {};
    this.objectArgs.forEach((objectArg) => {
      objectArg.write(object[this.arg.name])
    })
  }

  // writeObjectType(typeName: any) {
  //   const type = this.graphQLSchema.getType(typeName) as GraphQLObjectType;
  //   const dummyData: any = {};
  //   // console.log(type.getFields());
  //   Object.values(type.getFields()).forEach((item: any, idx) => {
  //     dummyData[item.name] = this.dataForType(item.type.toString());
  //   })
  //   return dummyData
  // }

  // dataForType(typeName: ScalarType) {
  //   let dummyData;
  //   // let type = this.graphQLSchema?.getType(typeName as string) as GraphQLObjectType;
  //   // _typeName = 
  //   if (typeName === "Int") { dummyData = 10101 }
  //   else if (typeName === "Float") { dummyData = 1.00 }
  //   else if (typeName === "ID") { dummyData = crypto.randomBytes(8).toString("hex") }
  //   else if (typeName === "String") { dummyData = "hello world" }
  //   else if (typeName === "Boolean") { dummyData = true }
  //   else {
  //     dummyData = this.writeObjectType(typeName);
  //   }
  //   return dummyData
  // }

}
