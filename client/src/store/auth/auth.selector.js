import { createSelector } from "reselect";

export const users = createSelector(
  state => state.Auth.users,
  users => {
    return users;
  }
);