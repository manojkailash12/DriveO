import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  isUpdated: false,
  isLoading: false,
  isError: false,
  isPageLoading:false,
  isOrderModalOpen:false,
  singleOrderDetails:null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.isLoading = true;
    },
    loadingEnd: (state) => {
      state.isLoading = false;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isError = false;
      state.isLoading = false;
    },
    signInFailure: (state, action) => {
      state.isError = action.payload;
      state.isLoading = false;
    },
    deleteUserStart: (state) => {
      state.isLoading = true;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.isError = false;
      state.isLoading = false;
    },
    deleteUserFailure: (state, action) => {
      state.isLoading = false;
      state.isError = action.payload;
    },
    signOut: (state) => {
      state.currentUser = null;
      state.isLoading = false;
      state.isError = false;
    },
    updateUserStart: (state) => {
      state.isLoading = true;
      state.isError = false;
    },
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isLoading = false;
      state.isError = false;
    },
    updateUserFailure: (state, action) => {
      state.isLoading = false;
      state.isError = action.payload;
    },
    editUserProfile: (state, action) => {
      // Update the entire currentUser object with the new data
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    setUpdated: (state, action) => {
      state.isUpdated = action.payload;
    },
    setPageLoading:(state,action) => {
      state.isPageLoading = action.payload
    },
    setIsOrderModalOpen: (state,action) => {
      state.isOrderModalOpen = action.payload
    },
    setSingleOrderDetails:(state,action) => {
      state.singleOrderDetails = action.payload
    }
  },
});

export const {
  signInFailure,
  signInStart,
  signInSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOut,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  editUserProfile,
  setUpdated,
  loadingEnd,
  setPageLoading,
  setIsOrderModalOpen,
  setSingleOrderDetails
} = userSlice.actions;

export default userSlice.reducer;
