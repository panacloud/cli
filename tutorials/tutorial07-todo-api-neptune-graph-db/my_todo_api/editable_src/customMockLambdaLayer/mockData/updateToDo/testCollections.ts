import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    updateToDo: [
      {
        arguments: {
          toDoId: "01",
          toDoInput: {
            title: "Florenza",
            description: "Tedi",
          },
        },
        response: {
          id: "01",
          title: "Casandra",
          description: "Riannon",
        },
      },
    ],
  },
};
