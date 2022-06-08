import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./reducers/Auth"; 
import RefreshReducer from "./reducers/Refresh"; 

const rootReducer = combineReducers({
  auth: AuthReducer,
  refresh: RefreshReducer
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }),
});

export type RootState = ReturnType<typeof rootReducer>

export default store;