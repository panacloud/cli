export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: any;
  AWSDateTime: any;
  AWSEmail: any;
  AWSIPAddress: any;
  AWSJSON: any;
  AWSPhone: any;
  AWSTime: any;
  AWSTimestamp: any;
  AWSURL: any;
}

export interface Mutation {
  __typename?: "Mutation";
  addTodo?: Maybe<Todo>;
  deleteTodo?: Maybe<Scalars["String"]>;
  updateTodo?: Maybe<Todo>;
}

export interface MutationAddTodoArgs {
  todo: TodoInput;
}

export interface MutationDeleteTodoArgs {
  todoId: Scalars["String"];
}

export interface MutationUpdateTodoArgs {
  todo: TodoInput;
}

export interface Query {
  __typename?: "Query";
  getTodos?: Maybe<Array<Maybe<Todo>>>;
}

export interface Todo {
  __typename?: "Todo";
  done: Scalars["Boolean"];
  id: Scalars["ID"];
  title: Scalars["String"];
}

export interface TodoInput {
  done: Scalars["Boolean"];
  id: Scalars["ID"];
  title: Scalars["String"];
}
