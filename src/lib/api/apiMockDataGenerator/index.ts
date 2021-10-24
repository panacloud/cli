import * as grphql from "graphql";
import * as fs from "fs";
import { RootMockObject, TestCollectionType } from "./MockObject";

const schema = fs.readFileSync("./src/schema.gql", { encoding: "utf8" });

const dummyData: TestCollectionType = { fields: {} };

const mockObject = new RootMockObject(schema);
mockObject.write(dummyData);

console.log(JSON.stringify(dummyData , null, 2));

