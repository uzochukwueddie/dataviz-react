import { IUser } from "../../../shared/interfaces/user.interface";

export interface IReduxAuthPayload {
  authInfo?: IUser;
}

export interface IReduxAuthPayload {
  type: string;
  payload: IReduxAuthPayload;
}
