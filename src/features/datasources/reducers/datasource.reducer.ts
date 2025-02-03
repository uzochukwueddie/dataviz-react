import { createSlice, Slice } from '@reduxjs/toolkit';
import { IAppDataSource, IReduxDataSource } from '../interfaces/datasource.interface';

const initialValue: IAppDataSource = {
  active: null,
  database: '',
  dataSource: []
};

const datasourceSlice: Slice = createSlice({
  name: 'datasource',
  initialState: initialValue,
  reducers: {
    addDataSource: (state: IAppDataSource, action: IReduxDataSource): IAppDataSource => {
      const newDatasource = {
        active: action.payload.active,
        database: action.payload.database,
        dataSource: action.payload.dataSource
      };

      return {
        ...state,
        ...newDatasource
      };
    },
    clearDataSOurce: (): IAppDataSource => {
      return initialValue;
    }
  }
});

export const { addDataSource, clearDataSOurce } = datasourceSlice.actions;
export default datasourceSlice.reducer;
