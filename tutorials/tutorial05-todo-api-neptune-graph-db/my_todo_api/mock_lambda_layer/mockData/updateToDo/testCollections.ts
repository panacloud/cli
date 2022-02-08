import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    updateToDo: [
      {
        arguments: {
          toDoId: "01",
          toDoInput: {
            title: "Maren",
            description: "Malory",
          },
        },
        response: {
          id: "01",
          title: "Melitta",
          description: "Loleta",
        },
      },
    ],
  },
};
