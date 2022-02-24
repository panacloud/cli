import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    updateToDo: [
      {
        arguments: {
          toDoId: "01",
          toDoInput: {
            title: "Holli",
            description: "Danyette",
          },
        },
        response: {
          id: "01",
          title: "Rozanne",
          description: "Charil",
        },
      },
    ],
  },
};
