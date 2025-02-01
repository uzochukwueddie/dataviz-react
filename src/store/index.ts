/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';
import authReducer from '../features/auth/reducers/auth.reducer';

export interface RootState {
    authUser: ReturnType<typeof authReducer>
};

const rootReducer = (state: RootState | undefined, action: any): RootState => {
    if (action.type === 'logout/updateLogout') {
        return {
            authUser: authReducer(undefined, action)
        }
    }

    return {
        authUser: authReducer(state?.authUser, action)
    };
};

export const store = configureStore({
    reducer: rootReducer,
    devTools: true
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;