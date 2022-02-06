import {
  ToDo,
  MutationCreateToDoArgs,
  MutationUpdateToDoArgs,
  MutationDeleteToDoArgs,
  QueryGetToDoArgs,
} from "../types";

export type TestCollection = {
  fields: {
    updateToDo: { arguments: MutationUpdateToDoArgs; response: ToDo }[];
  };
};
