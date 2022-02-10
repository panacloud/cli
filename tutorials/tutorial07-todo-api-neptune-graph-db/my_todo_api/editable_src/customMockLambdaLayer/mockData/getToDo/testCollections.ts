import { TestCollection } from "./testCollectionsTypes";

export const testCollections: TestCollection = {
  fields: {
    getToDo: [
      {
        arguments: {
          toDoId: "01",
        },
        response: {
          id: "01",
          title: "Nancey",
          description: "Doe",
        },
      },
    ],
  },
};
