import { IAppDataSource } from "../features/datasources/interfaces/datasource.interface";

export interface IReduxState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authUser: any;
    logout: boolean;
    datasource: IAppDataSource;
}
