import { authActionTypes } from "./auth.actiontype";

const initalState = {
  loggedInStatus: false,
  loggedInUser: null,
};

export const Auth = (state = initalState, action = {}) => {
  switch (action.type) {
    case authActionTypes.SET_LOGGED_IN_SUCCESS:
      return {
        ...state,
        loggedInStatus: true,
        loggedInUser: action.data
      };

    case authActionTypes.SET_LOGGED_IN_FAILED:
      return {
        ...state,
        loggedInStatus: false,
        loggedInUser: null,
      };

    default:
      return state;
  }
};
