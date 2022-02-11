import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    deleteToDo: [
      {
        arguments: {
          toDoId: "01",
        },
        response: {
          id: "01",
          title: "Ella",
          description: "Blancha",
        },
      },
    ],
  },
};
