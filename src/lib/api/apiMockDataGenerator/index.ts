import * as fs from "fs";
import { RootMockObject, TestCollectionType } from "./MockObject";

export {
    RootMockObject,
    TestCollectionType
}
// export default function generate() {
//     const schema = fs.readFileSync("./schema.gql", { encoding: "utf8" });

// const dummyData: TestCollectionType = { fields: {} };

// const mockObject = new RootMockObject(schema);
// mockObject.write(dummyData);

// console.log(JSON.stringify(dummyData , null, 2));

//     console.log(JSON.stringify(dummyData, null, 2));
//     // console.log(dummyData);
//     // return dummyData.fields;
// }
