import { IAppDataSource } from "../features/datasources/interfaces/datasource.interface";
import { ISQLPayload } from "../shared/interfaces/app.interface";
import { IUser } from "../shared/interfaces/user.interface";

export interface IReduxState {
  authUser: IUser;
  logout: boolean;
  datasource: IAppDataSource;
  collections: string[];
  documents: Array<Record<string, unknown>>;
  sqlQuery: ISQLPayload;
}
