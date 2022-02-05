import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    updateTodo: [
      {
        arguments: {
          todo: {
            id: "01",
            title: "Sondra",
            done: true,
          },
        },
        response: {
          id: "01",
          title: "Juliet",
          done: true,
        },
      },
    ],
  },
};
