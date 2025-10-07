// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import stateReconciler from "./reconciler";
import authReducer from "./authSlice"; // Create this later

import { persistStore, persistReducer } from "redux-persist";

const appReducer = combineReducers({
  auth: authReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
  return appReducer(state, action);
};

const persistConfig = {
  key: "root",
  storage,
  transforms: [stateReconciler],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
            "persist/FLUSH",
            "persist/PAUSE",
            "persist/PURGE",
            "persist/REMOVE",
          ],
        },
      }),
  });

  // Create and return the persistor alongside the store
  const persistor = persistStore(store);

  return { store, persistor };
};

export type AppStore = ReturnType<typeof makeStore>["store"];
export type AppPersistor = ReturnType<typeof makeStore>["persistor"];
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
