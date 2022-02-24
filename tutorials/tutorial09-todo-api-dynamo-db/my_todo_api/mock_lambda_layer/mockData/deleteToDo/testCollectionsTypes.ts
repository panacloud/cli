import { ToDo, MutationCreateToDoArgs, MutationDeleteToDoArgs } from "../types";

export type TestCollection = {
  fields: {
    deleteToDo: { arguments: MutationDeleteToDoArgs; response: String }[];
  };
};
