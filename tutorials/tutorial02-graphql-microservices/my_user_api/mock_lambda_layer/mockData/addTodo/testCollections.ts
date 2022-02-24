import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    addTodo: [
      {
        arguments: {
          todo: {
            id: "01",
            title: "Marcela",
            done: true,
          },
        },
        response: {
          id: "01",
          title: "Karita",
          done: true,
        },
      },
    ],
  },
};
