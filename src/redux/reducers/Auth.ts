import { createSelector, createSlice } from "@reduxjs/toolkit";

import { Auth } from "../../types/Auth";
import { RootState } from "../store";

const initialState: Auth = {
  user: null,
  token: null
};

const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

const { actions, reducer } = AuthSlice;

export const {
  setUser, setToken, reset
} = actions;

export const AuthSelector = (state: RootState) => state.auth;
export const UserSelector = createSelector(AuthSelector, (state) => state.user);
export const TokenSelector = createSelector(AuthSelector, (state) => state.token);

export default reducer;