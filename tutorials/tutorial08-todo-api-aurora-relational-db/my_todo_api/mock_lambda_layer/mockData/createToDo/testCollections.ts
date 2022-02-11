import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    createToDo: [
      {
        arguments: {
          toDoInput: {
            title: "Esmeralda",
            description: "Abbey",
          },
        },
        response: {
          id: "01",
          title: "Mame",
          description: "Simona",
        },
      },
    ],
  },
};
