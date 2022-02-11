import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    updateTodo: [
      {
        arguments: {
          todo: {
            id: "01",
            title: "Melany",
            done: true,
          },
        },
        response: {
          id: "01",
          title: "Florentia",
          done: true,
        },
      },
    ],
  },
};
