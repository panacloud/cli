import {
  Todo,
  MutationAddTodoArgs,
  MutationUpdateTodoArgs,
  MutationDeleteTodoArgs,
} from "../types";

export type TestCollection = {
  fields: {
    updateTodo: { arguments: MutationUpdateTodoArgs; response: Todo }[];
  };
};
