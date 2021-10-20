import { GraphQLSchema, buildSchema, GraphQLObjectType, GraphQLField } from "graphql";
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
    Object.keys(queries!).forEach((key) => {
      const queryMockObject = new QueryMockObject(this.graphQLSchema, key);
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
  private fieldObject: any
  constructor(graphQLSchema: GraphQLSchema, queryName: string) {
    super(graphQLSchema);
    this.queryName = queryName;
    const fieldType = graphQLSchema?.getType("Query") as GraphQLObjectType;
    this.fieldObject = fieldType.getFields()[queryName];

    this.fieldObject.args.forEach((arg: any) => {
      if (arg.type.toString() === "String") {
        this.objectArgs.push(
          new StringObjectArgs(graphQLSchema, this.fieldObject, arg)
        );
      } else if (arg.type.toString() === "Int") {
        this.objectArgs.push(
          new IntObjectArgs(graphQLSchema, this.fieldObject, arg)
        );
      } else if (arg.type.toString() === "ID") {
        this.objectArgs.push(
          new IdObjectArgs(graphQLSchema, this.fieldObject, arg)
        );
      } else if (arg.type.toString() === "Float") {
        this.objectArgs.push(
          new FloatObjectArgs(graphQLSchema, this.fieldObject, arg)
        );
      } else if (arg.type.toString() === "Boolean") {
        this.objectArgs.push(
          new BoolObjectArgs(graphQLSchema, this.fieldObject, arg)
        );
      } else {
        this.objectArgs.push(
          new CustomObjectArgs(graphQLSchema, this.fieldObject, arg)
        );
      }
    });

  }

  write(object: TestCollectionType) {
    object.fields[this.queryName] = [{ response: {}, arguments: {} }];
    this.objectArgs.forEach((v) => {
      v.write(object.fields[this.fieldObject.name][0].arguments);
    });
  }

}

abstract class ObjectArgs extends MockObject {
  protected fieldObject: any = {};
  constructor(graphQLSchema: GraphQLSchema, fieldObject: any) {
    super(graphQLSchema);
    this.fieldObject = fieldObject;
  }
}

class StringObjectArgs extends ObjectArgs {
  private arg: any = {};
  constructor(graphQLSchema: GraphQLSchema, fieldObject: any, arg: any) {
    super(graphQLSchema, fieldObject);
    this.fieldObject = fieldObject;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = "Hello";
    }
  }
}
class IntObjectArgs extends ObjectArgs {
  private arg: any = {};
  constructor(graphQLSchema: GraphQLSchema, fieldObject: any, arg: any) {
    super(graphQLSchema, fieldObject);
    this.fieldObject = fieldObject;
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
  private arg: any = {};
  constructor(graphQLSchema: GraphQLSchema, fieldObject: any, arg: any) {
    super(graphQLSchema, fieldObject);
    this.fieldObject = fieldObject;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = "01";
    }
  }
}
class FloatObjectArgs extends ObjectArgs {
  private arg: any = {};
  constructor(graphQLSchema: GraphQLSchema, fieldObject: any, arg: any) {
    super(graphQLSchema, fieldObject);
    this.fieldObject = fieldObject;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = 0.1;
    }
  }
}

class BoolObjectArgs extends ObjectArgs {
  private arg: any = {};
  constructor(graphQLSchema: GraphQLSchema, fieldObject: any, arg: any) {
    super(graphQLSchema, fieldObject);
    this.fieldObject = fieldObject;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    if (object) {
      object[this.arg.name] = false;
    }
  }
}


class CustomObjectArgs extends ObjectArgs {
  private arg: any = {};
  constructor(graphQLSchema: GraphQLSchema, fieldObject: any, arg: any) {
    super(graphQLSchema, fieldObject);
    this.fieldObject = fieldObject;
    this.arg = arg;
  }

  write(object: ArgAndResponseType['arguments']): void {
    // console.log(this.arg)
    // if (object) {
    object[this.arg.name] = this.writeObjectType(this.arg.type);
    // };
  }

  writeObjectType(typeName: any) {
    const type = this.graphQLSchema.getType(typeName) as GraphQLObjectType;
    const dummyData: any = {};
    // console.log(type.getFields());
    Object.values(type.getFields()).forEach((item: any, idx) => {
      dummyData[item.name] = this.dataForType(item.type.toString());
    })
    return dummyData
  }

  dataForType(typeName: ScalarType) {
    let dummyData;
    // let type = this.graphQLSchema?.getType(typeName as string) as GraphQLObjectType;
    // _typeName = 
    if (typeName === "Int") { dummyData = 10101 }
    else if (typeName === "Float") { dummyData = 1.00 }
    else if (typeName === "ID") { dummyData = crypto.randomBytes(8).toString("hex") }
    else if (typeName === "String") { dummyData = "hello world" }
    else if (typeName === "Boolean") { dummyData = true }
    else {
      dummyData = this.writeObjectType(typeName);
    }
    return dummyData
  }

}
