import { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { IDatasource } from '../../datasources/interfaces/datasource.interface';
import { useAppDispatch, useAppSelector } from '../../../store';
import { IReduxState } from '../../../store/store.interface';
import CustomDropdown, { DropdownOption } from '../../../shared/components/custom-dropdown';
import { FetchResult, useLazyQuery } from '@apollo/client';
import { EXECUTE_POSTGRESQL_QUERY, GET_SINGLE_POSTGRESQL_COLLECTIONS } from '../graphql/postgresql';
import { addSQLQuery } from '../reducers/sql.reducer';
import { ToastService } from '../../../shared/services/toast.service';
import { addDataSource } from '../../datasources/reducers/datasource.reducer';
import { addCollections } from '../reducers/collections.reducer';
import { addDocuments, clearDocuments } from '../reducers/documents.reducer';
import { getLocalStorageItem } from '../../../shared/utils/utils';
import AddDatasource from '../../datasources/components/add-datasource';
import { eventBus } from '../../../shared/events';
import { EventType } from '../../../shared/events/types';

const DEFAULT_PROJECT: IDatasource = {
  id: '',
  projectId: '',
  type: '',
  database: ''
};

const DataSourceSidebar: FC = (): ReactElement => {
  const rootDatasource = useAppSelector((state: IReduxState) => state.datasource);
  const dispatch = useAppDispatch();
  const [tables, setTables] = useState<string[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);
  const [isAddModal, setIsAddModal] = useState<boolean>(false);
  const [defaultProject, setDefaultProject] = useState<DropdownOption | null>(null);
  const [getSinglePostgreSQLCollections] = useLazyQuery(GET_SINGLE_POSTGRESQL_COLLECTIONS, {
    fetchPolicy: 'no-cache'
  });
  const [executePostgreSQLQuery] = useLazyQuery(EXECUTE_POSTGRESQL_QUERY, {
    fetchPolicy: 'no-cache'
  });

  const handleDropdownChange = (option: DropdownOption): void => {
    getSelectedDatasourceCollections(option.value, `${option.id}`);
  };

  const handleAddDataSource = (): void => {
    setIsAddModal(true);
  };

  const loadDatasources = useCallback(() => {
    const dataSource = rootDatasource.dataSource;
    const dropdownOptions = dataSource.map((datasource: IDatasource) => {
      return {
        id: datasource.id,
        label: datasource.projectId,
        value: datasource.projectId
      };
    });
    setDropdownOptions(dropdownOptions);
  }, [rootDatasource.dataSource]);

  const onDropdownClicked = (): void => {
    loadDatasources();
  };

  const onSelectTable = (table: string): void => {
    const sql = `SELECT * FROM ${table} LIMIT 50`;
    dispatch(addSQLQuery(sql));
    getTableData(`${rootDatasource.active?.projectId}`, sql);
  };

  const getSelectedDatasourceCollections = useCallback(
    async (projectId: string, datasourceId: string): Promise<void> => {
      const toastService: ToastService = new ToastService();
      try {
        const result: FetchResult = await getSinglePostgreSQLCollections({
          variables: { projectId }
        });
        const collections = result?.data?.getSinglePostgreSQLCollections;
        setTables(collections);
        const project = rootDatasource.dataSource.find((source: IDatasource) => source.id === datasourceId);
        dispatch(
          addDataSource({
            active: project,
            database: project?.database,
            dataSource: rootDatasource.dataSource
          })
        );
        dispatch(addCollections(collections));
        dispatch(clearDocuments([]));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toastService.show('Failed to return tables', 'error');
      }
    },
    [dispatch, getSinglePostgreSQLCollections, rootDatasource.dataSource]
  );

  const getTableData = useCallback(
    async (projectId: string, sqlQuery: string): Promise<void> => {
      const toastService: ToastService = new ToastService();
      try {
        const result: FetchResult = await executePostgreSQLQuery({
          variables: {
            data: {
              projectId,
              sqlQuery
            }
          }
        });
        const data = result?.data?.executePostgreSQLQuery;
        const { documents } = data;
        const filteredDocuments = JSON.parse(documents).filter(
          (obj: Record<string, unknown>) => Object.keys(obj).length > 0
        );
        dispatch(addDocuments(filteredDocuments));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toastService.show('Failed to return tables', 'error');
      }
    },
    [dispatch, executePostgreSQLQuery]
  );

  const setDefaultDropdownProject = useCallback(() => {
    const activeProject = getLocalStorageItem('activeProject');
    const projects = rootDatasource.dataSource;
    const project =
      projects.length > 0 && !activeProject && projects[0].database
        ? projects[0]
        : activeProject !== 'undefined' && activeProject !== null
        ? activeProject
        : DEFAULT_PROJECT;
    setDefaultProject({
      id: project.id,
      label: project.projectId,
      value: project.projectId
    });
    if (project.id && project.projectId) {
      getSelectedDatasourceCollections(project.projectId, `${project.id}`);
    }
  }, [getSelectedDatasourceCollections, rootDatasource.dataSource]);

  useEffect(() => {
    loadDatasources();
    setDefaultDropdownProject();

    eventBus.subscribe(EventType.CLOSE_DATASOURCE_MODAL, (payload: unknown) => {
      setIsAddModal(payload as boolean);
    });

    return () => {
      eventBus.unsubscribe(EventType.CLOSE_DATASOURCE_MODAL, () => {
        console.log('CLOSE_DATASOURCE_MODAL event unsubscribed');
      });
    };
  }, [loadDatasources, setDefaultDropdownProject]);

  return (
    <>
      {isAddModal && <AddDatasource />}
      <aside className="h-screen bg-white border-l border-gray-200 w-64 flex-shrink-0 transition-all duration-300 ease-in-out">
        <div className="px-4 py-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Data Sources</h3>
          </div>

          <div className="mt-4" onClick={onDropdownClicked}>
            <CustomDropdown
              options={dropdownOptions}
              dropdownMessage="No datasource"
              placeholder="Select datasource"
              defaultOption={defaultProject}
              onSelect={handleDropdownChange}
            />
          </div>

          <button
            onClick={handleAddDataSource}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-700"
          >
            Add New Data Source
          </button>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Available Tables</h4>
            <div className="space-y-2 overflow-y-auto h-[calc(100vh-300px)]">
              {tables.map((table: string) => (
                <div
                  key={table}
                  onClick={() => onSelectTable(table)}
                  className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  {table}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DataSourceSidebar;
