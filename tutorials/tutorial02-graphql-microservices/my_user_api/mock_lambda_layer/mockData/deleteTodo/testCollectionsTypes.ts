import {
  Todo,
  MutationAddTodoArgs,
  MutationUpdateTodoArgs,
  MutationDeleteTodoArgs,
} from "../types";

export type TestCollection = {
  fields: {
    deleteTodo: { arguments: MutationDeleteTodoArgs; response: String }[];
  };
};
