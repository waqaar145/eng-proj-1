import {call, all} from 'redux-saga/effects';
import {authSaga} from './auth/auth.saga';
import {chatSaga} from './chat/chat.saga'

function* rootSaga() {
  yield all([
    call(authSaga),
    call(chatSaga)
  ]);
}

export default rootSaga;