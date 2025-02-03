/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';
import authReducer from '../features/auth/reducers/auth.reducer';
import logoutReducer from '../features/auth/reducers/logout.reducer';
import datasourceReducer from '../features/datasources/reducers/datasource.reducer';

export interface RootState {
  authUser: ReturnType<typeof authReducer>;
  logout: ReturnType<typeof logoutReducer>;
  datasource: ReturnType<typeof datasourceReducer>;
}

const rootReducer = (state: RootState | undefined, action: any): RootState => {
  if (action.type === 'logout/updateLogout') {
    return {
      authUser: authReducer(undefined, action),
      logout: logoutReducer(undefined, action),
      datasource: datasourceReducer(undefined, action),
    };
  }

  return {
    authUser: authReducer(state?.authUser, action),
    logout: logoutReducer(state?.logout, action),
    datasource: datasourceReducer(state?.datasource, action),
  };
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: true
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
