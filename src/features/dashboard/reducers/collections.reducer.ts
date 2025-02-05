import { createSlice, Slice } from '@reduxjs/toolkit';

interface IReduxCollections {
  type: string;
  payload: string[];
}

const initialValue: string[] = [];

const collectionSlice: Slice = createSlice({
  name: 'collections',
  initialState: initialValue,
  reducers: {
    addCollections: (_: string[], action: IReduxCollections): string[] => {
      const newPayload: string[] = [...action.payload];
      const uniq = [...new Set(newPayload)];
      return uniq;
    },
    clearCollections: (): string[] => {
      return initialValue;
    }
  }
});

export const { addCollections, clearCollections } = collectionSlice.actions;
export default collectionSlice.reducer;
