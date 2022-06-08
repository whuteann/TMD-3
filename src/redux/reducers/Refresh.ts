import { createSelector, createSlice } from "@reduxjs/toolkit";

import { RootState } from "../store";

interface Refresh {
  isRefresh: boolean
}

const initialState: Refresh = {
  isRefresh: false
};

const RefreshSlice = createSlice({
  name: "Refresh",
  initialState,
  reducers: {
    setRefresh: (state, action) => {
      state.isRefresh = action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

const { actions, reducer } = RefreshSlice;

export const {
  setRefresh, reset 
} = actions;

export const RefreshSelector = (state: RootState) => state.refresh.isRefresh;

export default reducer;