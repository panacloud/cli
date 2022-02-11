import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    updateToDo: [
      {
        arguments: {
          toDoId: "01",
          toDoInput: {
            title: "Junina",
            description: "Shalne",
          },
        },
        response: {
          id: "01",
          title: "Martita",
          description: "Philly",
        },
      },
    ],
  },
};
