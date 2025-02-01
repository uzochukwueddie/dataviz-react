/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IReduxAuthPayload {
    authInfo?: any;
}

export interface IReduxAuthPayload {
    type: string;
    payload: IReduxAuthPayload;
}