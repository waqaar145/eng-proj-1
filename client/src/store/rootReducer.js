import {combineReducers} from 'redux';
import {Auth} from './auth/auth.reducer';
import {Chat} from './chat/chat.reducer';

const rootReducer = combineReducers({
  Auth,
  Chat
});

export default rootReducer;