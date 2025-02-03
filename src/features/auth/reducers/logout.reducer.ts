import { createSlice, Slice } from '@reduxjs/toolkit';

const initialValue: boolean = true;

const logoutSlice: Slice = createSlice({
  name: 'logout',
  initialState: initialValue,
  reducers: {
    updateLogout: (state: boolean): boolean => {
      return state;
    }
  }
});

export const { updateLogout } = logoutSlice.actions;
export default logoutSlice.reducer;
