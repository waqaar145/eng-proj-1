import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";
import rootSaga from "./rootSaga";

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension");
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const reducerFunc = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    return nextState;
  } else {
    return rootReducer(state, action);
  }
};

const persistConfig = {
  key: "primary",
  storage,
  whitelist: ["ContentBuilder"],
};

const persistedReducer = persistReducer(persistConfig, reducerFunc);

export const makeStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(persistedReducer, bindMiddleware([sagaMiddleware]));
  store.__persistor = persistStore(store);
  store.sagaTask = sagaMiddleware.run(rootSaga);
  return store;
};

export const wrapper = createWrapper(makeStore, { debug: true });
