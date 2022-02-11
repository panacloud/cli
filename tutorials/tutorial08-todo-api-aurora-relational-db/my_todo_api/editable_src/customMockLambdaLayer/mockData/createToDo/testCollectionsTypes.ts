import {
  ToDo,
  MutationCreateToDoArgs,
  MutationUpdateToDoArgs,
  MutationDeleteToDoArgs,
  QueryGetToDoArgs,
} from "../types";

export type TestCollection = {
  fields: {
    createToDo: { arguments: MutationCreateToDoArgs; response: ToDo }[];
  };
};
