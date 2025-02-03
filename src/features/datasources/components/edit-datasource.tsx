import { FC, ReactElement, useEffect, useRef } from 'react';
import ModalComponent from '../../../shared/components/modal';
import { useAppDispatch, useAppSelector } from '../../../store';
import { FetchResult, useMutation, useQuery } from '@apollo/client';
import { CHECK_POSTGRESQL_CONNECTION, EDIT_DATASOURCE, GET_SINGLE_DATA_SOURCE } from '../graphql/datasource';
import { eventBus } from '../../../shared/events';
import { EventType } from '../../../shared/events/types';
import { IDatasource, IPostgreSQLDatasource } from '../interfaces/datasource.interface';
import DataSourceForm from './datasource-form';
import { ToastService } from '../../../shared/services/toast.service';
import { convertToBase64, getLocalStorageItem, setLocalStorageItem } from '../../../shared/utils/utils';
import { addDataSource } from '../reducers/datasource.reducer';
import { IReduxState } from '../../../store/store.interface';

const EditDatasource: FC<{ projectId: string }> = ({ projectId }): ReactElement => {
  const rootDatasource = useAppSelector((state: IReduxState) => state.datasource);
  const dispatch = useAppDispatch();
  const selectedDatasourceData = useRef<IPostgreSQLDatasource>();
  const [checkPostgresqlConnection] = useMutation(CHECK_POSTGRESQL_CONNECTION, {
    fetchPolicy: 'no-cache'
  });
  const [editDataSource] = useMutation(EDIT_DATASOURCE, {
    fetchPolicy: 'no-cache'
  });
  const { data, error } = useQuery(GET_SINGLE_DATA_SOURCE, {
    fetchPolicy: 'no-cache',
    variables: { projectId }
  });
  if (!error && data) {
    const { getDataSourceByProjectId } = data;
    selectedDatasourceData.current = getDataSourceByProjectId;
  }

  const closeModal = (): void => {
    eventBus.publish(EventType.CLOSE_DATASOURCE_MODAL, false);
  };

  const handleConnectionSave = async (config: IPostgreSQLDatasource): Promise<void> => {
    const toastService: ToastService = new ToastService();
    try {
      const updatedConfig: IPostgreSQLDatasource = {
        ...config,
        username: convertToBase64(config.username),
        password: convertToBase64(config.password),
        databaseName: convertToBase64(config.databaseName),
        databaseUrl: convertToBase64(config.databaseUrl)
      };
      const result: FetchResult = await editDataSource({
        variables: { source: updatedConfig }
      });
      if (result && result.data) {
        const { dataSource } = result.data.editDataSource;
        const activeDatasource = rootDatasource.active;
        const activeProject = getLocalStorageItem('activeProject');
        if (activeProject !== 'undefined' && activeProject.projectId === activeDatasource?.projectId) {
          const datasourceActive = dataSource.find((source: IDatasource) => source.projectId === config.projectId);
          setLocalStorageItem('activeProject', JSON.stringify(datasourceActive));
        }
        const activeSource =
          activeProject !== 'undefined' && activeProject.projectId === activeDatasource?.projectId
            ? activeDatasource
            : dataSource[0];
        dispatch(
          addDataSource({
            active: activeSource,
            database: activeSource.database,
            dataSource
          })
        );
        toastService.show('PostgreSQL datasource updated successfully.', 'success');
        eventBus.publish(EventType.CLOSE_DATASOURCE_MODAL, false);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toastService.show('Failed to update postgresql datasource.', 'error');
    }
  };

  const handleConnectionTest = async (config: IPostgreSQLDatasource): Promise<void> => {
    const toastService: ToastService = new ToastService();
    try {
      const result: FetchResult = await checkPostgresqlConnection({
        variables: { datasource: config }
      });
      if (result && result.data) {
        toastService.show('PostgreSQL connection test successful.', 'success');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toastService.show('PostgreSQL connection test failed.', 'error');
    }
  };

  useEffect(() => {
    eventBus.subscribe(EventType.POSTGRESQL_DATASOURCE_TEST, (payload: unknown) => {
      handleConnectionTest(payload as IPostgreSQLDatasource);
    });
    eventBus.subscribe(EventType.POSTGRESQL_DATASOURCE_SAVE, (payload: unknown) => {
      handleConnectionSave(payload as IPostgreSQLDatasource);
    });

    return () => {
      eventBus.unsubscribe(EventType.POSTGRESQL_DATASOURCE_TEST, () => {
        console.log('POSTGRESQL_DATASOURCE_TEST event unsubscribed');
      });
      eventBus.unsubscribe(EventType.POSTGRESQL_DATASOURCE_SAVE, () => {
        console.log('POSTGRESQL_DATASOURCE_SAVE event unsubscribed');
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalComponent>
      <div className="w-full md:w-[600px] md:max-w-2xl">
        <div className="flex items-center justify-between p-4 border-gray-100 border-b-1">
          <h2 className="text-xl font-semibold">Edit PostgreSQL Connection</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 cursor-pointer hover:text-gray-700"
            aria-label="Close modal"
          >
            <i className="fa fa-xmark"></i>
          </button>
        </div>
        <DataSourceForm onCancel={closeModal} datasource={selectedDatasourceData.current} />
      </div>
    </ModalComponent>
  );
};

export default EditDatasource;
