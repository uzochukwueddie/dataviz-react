import { ChangeEvent, FC, ReactElement, useEffect, useState } from 'react';
import { useAppSelector } from '../../../store';
import { IReduxState } from '../../../store/store.interface';
import { useDispatch } from 'react-redux';
import { useLazyQuery } from '@apollo/client';
import { GET_POSTGRESQL_TABLE_DATA } from '../graphql/postgresql';
import { ToastService } from '../../../shared/services/toast.service';
import { addPromptSQLQuery, clearPromptSQLQuery } from '../reducers/sql.reducer';
import { clearDocuments } from '../reducers/documents.reducer';
import hljs from 'highlight.js';

interface PromptEditorProps {
  onLoadingChange: (loading: boolean) => void;
  onPromptResult: (result: string) => void;
}

const PromptEditor: FC<PromptEditorProps> = ({ onLoadingChange, onPromptResult }): ReactElement => {
  const rootDatasource = useAppSelector((state: IReduxState) => state.datasource);
  const sqlData = useAppSelector((state: IReduxState) => state.sqlQuery);
  const [prompt, setPrompt] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>('No SQL generated yet');
  const dispatch = useDispatch();
  const [getSQLQueryData] = useLazyQuery(GET_POSTGRESQL_TABLE_DATA, {
    fetchPolicy: 'no-cache'
  });

  const handleSubmit = async (): Promise<void> => {
    const toastService = new ToastService();
    if (!prompt) return;

    try {
      onLoadingChange(true);
      const result = await getSQLQueryData({
        variables: {
          info: {
            prompt,
            projectId: rootDatasource.active?.projectId
          }
        }
      });

      const data = result?.data?.getSQLQueryData;
      onPromptResult(data);

      const { sql } = JSON.parse(data);
      const dataSQL = sql.replace(/\n/g, ' ');
      setSqlQuery(dataSQL.replace(/\s+/g, ' '));
      dispatch(addPromptSQLQuery(dataSQL.replace(/\s+/g, ' ')));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toastService.show('Failed to return data.', 'error');
    } finally {
      onLoadingChange(false);
    }
  };

  const copySqlToClipboard = () => {
    if (sqlQuery) {
      navigator.clipboard
        .writeText(sqlQuery)
        .then(() => console.log('SQL copied to clipboard'))
        .catch((error) => console.log('Failed to copy SQL', error));
    }
  };

  const clearEditor = () => {
    setPrompt('');
    setSqlQuery('No SQL generated yet');
    onPromptResult(JSON.stringify({ sql: '', result: [] }));
    dispatch(clearPromptSQLQuery(''));
    dispatch(clearDocuments([]));
  };

  useEffect(() => {
    if (sqlData && sqlData.promptQuery) {
      setSqlQuery(sqlData.promptQuery);
    }
    hljs.highlightAll();
  }, [sqlData]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 px-4 py-2 gap-4 flex justify-end items-center">
        <button
          onClick={clearEditor}
          type="button"
          className="px-4 py-2 cursor-pointer bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!prompt}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Run Query
        </button>
      </div>

      <textarea
        name="promptText"
        value={prompt}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPrompt(event.target.value)}
        placeholder="Show me all users who signed up in the last month"
        className="w-full h-30 p-4 focus:outline-none resize-none"
      ></textarea>
      <div className="border border-gray-200 rounded-t-lg bg-white py-2">
        <div className="flex items-center justify-between px-3">
          <h3 className="font-medium">Generated SQL</h3>
          <button
            onClick={copySqlToClipboard}
            className="text-sm cursor-pointer text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <i className="fa fa-copy"></i>
            Copy
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>
            <code className="language-sql">{sqlQuery}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;
