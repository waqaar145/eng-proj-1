import { all, call, takeLatest } from "redux-saga/effects";
import { authService } from "./../../services";
import { authActionTypes } from "./auth.actiontype";
import { actions } from "./auth.action";
import { put } from "redux-saga/effects";

function* handleLoginSuccess({ payload: { data, Router } }) {
  yield put(actions.setLoggedInSuccess(data));
}

function* handleLoggedInUser({ headers }) {
  try {
    let { data } = yield authService.getLoggedInUser(headers);
    console.log(data)
    yield put(actions.setLoggedInSuccess(data));
  } catch (error) {
    yield put(actions.setLoggedInFailed());
  }
}

export function* loginSuccess() {
  yield takeLatest(authActionTypes.WATCH_LOGIN_SUCCESS, handleLoginSuccess);
}

export function* getLoggedInUser() {
  yield takeLatest(authActionTypes.WATCH_LOGGED_IN_USER, handleLoggedInUser);
}

export function* authSaga() {
  yield all([call(loginSuccess), call(getLoggedInUser)]);
}
