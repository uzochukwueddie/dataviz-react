/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RootState {};

const rootReducer = (_state: RootState | undefined, action: any): RootState => {
    if (action.type === 'logout/updateLogout') {
        return {}
    }

    return {};
};

export const store = configureStore({
    reducer: rootReducer,
    devTools: true
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;