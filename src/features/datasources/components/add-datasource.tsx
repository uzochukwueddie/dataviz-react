import { FC, ReactElement, useEffect } from 'react';
import ModalComponent from '../../../shared/components/modal';
import { useAppDispatch } from '../../../store';
import { FetchResult, useMutation } from '@apollo/client';
import { CHECK_POSTGRESQL_CONNECTION, CREATE_POSTGRESQL_DATASOURCE } from '../graphql/datasource';
import { eventBus } from '../../../shared/events';
import { EventType } from '../../../shared/events/types';
import { IPostgreSQLDatasource } from '../interfaces/datasource.interface';
import DataSourceForm from './datasource-form';
import { ToastService } from '../../../shared/services/toast.service';
import { convertToBase64, setLocalStorageItem } from '../../../shared/utils/utils';
import { addDataSource } from '../reducers/datasource.reducer';

const AddDatasource: FC = (): ReactElement => {
  const dispatch = useAppDispatch();
  const [checkPostgresqlConnection] = useMutation(CHECK_POSTGRESQL_CONNECTION, {
    fetchPolicy: 'no-cache'
  });
  const [createPostgresqlDataSource] = useMutation(CREATE_POSTGRESQL_DATASOURCE, {
    fetchPolicy: 'no-cache'
  });

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
      const result: FetchResult = await createPostgresqlDataSource({
        variables: { source: updatedConfig }
      });
      if (result && result.data) {
        const { dataSource } = result.data.createPostgresqlDataSource;
        setLocalStorageItem('activeProject', JSON.stringify(dataSource[0]));
        dispatch(
          addDataSource({
            active: dataSource[0],
            database: dataSource[0].database,
            dataSource
          })
        );
        toastService.show('PostgreSQL datasource created successfully.', 'success');
        eventBus.publish(EventType.CLOSE_DATASOURCE_MODAL, false);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toastService.show('Failed to create postgresql datasource.', 'error');
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
          <h2 className="text-xl font-semibold">New PostgreSQL Connection</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 cursor-pointer hover:text-gray-700"
            aria-label="Close modal"
          >
            <i className="fa fa-xmark"></i>
          </button>
        </div>
        <DataSourceForm onCancel={closeModal} />
      </div>
    </ModalComponent>
  );
};

export default AddDatasource;
