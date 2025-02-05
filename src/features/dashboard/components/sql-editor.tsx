import { ChangeEvent, FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { IReduxState } from '../../../store/store.interface';
import { FetchResult, useLazyQuery } from '@apollo/client';
import { EXECUTE_POSTGRESQL_QUERY } from '../graphql/postgresql';
import { ToastService } from '../../../shared/services/toast.service';
import { addDocuments, clearDocuments } from '../reducers/documents.reducer';
import { addSQLQuery, clearSQLQuery } from '../reducers/sql.reducer';
import { addLimitIfNeeded, addQuotesToColumnNames, addQuotesToTableNames } from '../../../shared/utils/pg-utils';

interface SqlEditorProps {
  onQueryResult: (results: Record<string, unknown>[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

interface ValidationState {
  message: string;
  isValid: boolean;
}

type QueryValidationResult = {
  isValid: boolean;
  message: string;
};

const SqlEditor: FC<SqlEditorProps> = ({ onQueryResult, onLoadingChange }): ReactElement => {
  const rootDatasource = useAppSelector((state: IReduxState) => state.datasource);
  const sqlData = useAppSelector((state: IReduxState) => state.sqlQuery);
  const [query, setQuery] = useState<string>('');
  const [validationState, setValidationState] = useState<ValidationState>({
    message: '',
    isValid: false
  });
  const dispatch = useAppDispatch();
  const [executePostgreSQLQuery] = useLazyQuery(EXECUTE_POSTGRESQL_QUERY, {
    fetchPolicy: 'no-cache'
  });

  const isSelectStatement = useCallback((queryText: string): boolean => {
    const normalizedQuery = queryText.trim().toUpperCase();

    if (!normalizedQuery.startsWith('SELECT')) {
      return false;
    }

    const prohibitedKeywords: ReadonlyArray<string> = [
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'TRUNCATE',
      'GRANT',
      'REVOKE'
    ];

    return !prohibitedKeywords.some((keyword) => normalizedQuery.includes(keyword));
  }, []);

  const validateQuery = useCallback(
    (queryText: string): QueryValidationResult => {
      if (!queryText.trim()) {
        return {
          message: 'Please enter s SQL query',
          isValid: false
        };
      }

      if (!isSelectStatement(queryText)) {
        return {
          message: 'Only SELECT statements are allowed',
          isValid: false
        };
      }

      return {
        message: 'Valid SELECT query',
        isValid: true
      };
    },
    [isSelectStatement]
  );

  const onQueryChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const newQuery = event.target.value;
      setQuery(newQuery);

      const validationResult = validateQuery(newQuery);
      setValidationState({
        message: validationResult.message,
        isValid: validationResult.isValid
      });
    },
    [validateQuery]
  );

  const getTableData = useCallback(
    async (projectId: string, sqlQuery: string): Promise<void> => {
      const toastService: ToastService = new ToastService();
      try {
        onLoadingChange(true);
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
        console.log(JSON.parse(documents));
        const filteredDocuments = JSON.parse(documents).filter(
          (obj: Record<string, unknown>) => Object.keys(obj).length > 0
        );
        dispatch(addDocuments(filteredDocuments));
        onQueryResult(filteredDocuments);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toastService.show('Failed to return tables', 'error');
      } finally {
        onLoadingChange(false);
      }
    },
    [dispatch, executePostgreSQLQuery, onLoadingChange, onQueryResult]
  );

  const executeQuery = () => {
    if (validationState.isValid && query) {
      dispatch(addSQLQuery(query));
      const processedQuery = addLimitIfNeeded(query);
      const updatedPGTable = addQuotesToTableNames(processedQuery);
      const updatedPGColumns = addQuotesToColumnNames(updatedPGTable);
      getTableData(`${rootDatasource.active?.projectId}`, updatedPGColumns);
    }
  };

  const clearEditor = () => {
    setQuery('');
    setValidationState({
      message: '',
      isValid: false
    });
    dispatch(clearSQLQuery(''));
    dispatch(clearDocuments([]));
    onQueryResult([]);
  };

  const validationMessageClasses = `px-3 py-1 rounded-sm ${
    validationState.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`;

  useEffect(() => {
    if (sqlData && sqlData.sqlQuery) {
      setQuery(sqlData.sqlQuery);
    }
  }, [sqlData]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 px-4 py-2 gap-4 flex justify-end items-center">
        <button
          onClick={clearEditor}
          className="px-4 py-2 cursor-pointer bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          Clear
        </button>
        <button
          onClick={executeQuery}
          disabled={!validationState.isValid}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Run Query
        </button>
      </div>
      <div className="w-full mx-auto">
        <div className="bg-gray-800 p-4">
          <div className="relative">
            <textarea
              value={query}
              onChange={onQueryChange}
              className="w-full h-30 bg-gray-900 text-white font-mono p-4 rounded-md resize-none focus:outline-none"
              placeholder="Enter your SELECT query here..."
            ></textarea>
            {validationState.message && <div className={validationMessageClasses}>{validationState.message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;
