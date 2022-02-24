import { ToDo, MutationCreateToDoArgs, MutationDeleteToDoArgs } from "../types";

export type TestCollection = {
  fields: {
    createToDo: { arguments: MutationCreateToDoArgs; response: ToDo }[];
  };
};
