import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import AddDatasource from './components/add-datasource';
import { eventBus } from '../../shared/events';
import { EventType } from '../../shared/events/types';
import DataSourceGrid from './components/datasource-list';
import { useAppDispatch, useAppSelector } from '../../store';
import { IReduxState } from '../../store/store.interface';
import EditDatasource from './components/edit-datasource';
import { ToastService } from '../../shared/services/toast.service';
import { FetchResult, useMutation } from '@apollo/client';
import { DELETE_DATA_SOURCE } from './graphql/datasource';
import { IDatasource } from './interfaces/datasource.interface';
import { addDataSource } from './reducers/datasource.reducer';
import { setLocalStorageItem } from '../../shared/utils/utils';

interface IModal {
  add: boolean;
  edit: boolean;
}

const Datasource: FC = (): ReactElement => {
  const rootDatasource = useAppSelector((state: IReduxState) => state.datasource);
  const [modal, setModal] = useState<IModal>({ add: false, edit: false });
  const selectedProjectId = useRef<string>('');
  const dispatch = useAppDispatch();
  const [deleteDatasource] = useMutation(DELETE_DATA_SOURCE, {
    fetchPolicy: 'no-cache'
  });

  const showAddModal = (): void => {
    setModal({ ...modal, add: true });
  };

  const handleEdit = (projectId: string): void => {
    selectedProjectId.current = projectId;
    setModal({ ...modal, edit: true });
  };

  const handleDelete = async (datasourceId: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this data source?')) {
      const toastService: ToastService = new ToastService();
      try {
        const result: FetchResult = await deleteDatasource({
          variables: { datasourceId }
        });
        if (result && result.data) {
          const { id } = result.data.deleteDatasource;
          const active = rootDatasource.active;
          const sources = rootDatasource.dataSource.filter((source: IDatasource) => source.id !== id);
          const hasActiveDatasource = sources.some((source: IDatasource) => source.id === active?.id);
          const activeSource = hasActiveDatasource ? active : sources[0];
          dispatch(
            addDataSource({
              active: activeSource,
              database: activeSource?.database,
              dataSource: sources
            })
          );
          setLocalStorageItem('activeProject', JSON.stringify(activeSource));
          toastService.show('PostgreSQL datasource deleted successfully.', 'success');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toastService.show('Failed to delete datasource.', 'error');
      }
    }
  };

  useEffect(() => {
    eventBus.subscribe(EventType.CLOSE_DATASOURCE_MODAL, (payload: unknown) => {
      setModal({ edit: payload as boolean, add: payload as boolean });
    });

    return () => {
      eventBus.unsubscribe(EventType.CLOSE_DATASOURCE_MODAL, () => {
        console.log('CLOSE_DATASOURCE_MODAL event unsubscribed');
      });
    };
  }, []);

  return (
    <div className="px-4 py-2">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your datasources</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={showAddModal}
            className="bg-blue-600 cursor-pointer text-white px-4 py-1 gap-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <i className="fa fa-plus"></i>
            Add Data Source
          </button>
        </div>
      </div>

      <DataSourceGrid
        dataSources={rootDatasource?.dataSource ?? []}
        onEdit={(projectId) => handleEdit(projectId)}
        onDelete={(id) => handleDelete(id)}
      />

      {modal.add && <AddDatasource />}
      {modal.edit && <EditDatasource projectId={selectedProjectId.current} />}
    </div>
  );
};

export default Datasource;
