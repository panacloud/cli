import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    addTodo: [
      {
        arguments: {
          todo: {
            id: "01",
            title: "Cayla",
            done: true,
          },
        },
        response: {
          id: "01",
          title: "Erinn",
          done: true,
        },
      },
    ],
  },
};
