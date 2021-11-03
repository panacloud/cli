import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    updateToDo: [
      {
        arguments: {
          toDoId: "01",
          toDoInput: {
            title: "Rosetta",
            description: "Catherine",
          },
        },
        response: {
          id: "01",
          title: "Giulia",
          description: "Sharia",
        },
      },
    ],
  },
};
