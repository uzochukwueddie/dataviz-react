import { FC, ReactElement, useEffect, useState } from 'react';
import { useAppSelector } from '../../store';
import { IReduxState } from '../../store/store.interface';
import DataSourceSidebar from './components/data-sidebar';
import PromptEditor from './components/prompt-editor';
import SqlEditor from './components/sql-editor';
import ResultTable from './components/result-table';

interface ITab {
  label: string;
}

interface ITableData {
  prompt: Record<string, unknown>[];
  sql: Record<string, unknown>[];
}

const tabs: ITab[] = [{ label: 'Prompt' }, { label: 'Query' }];

const Dashboard: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const documents = useAppSelector((state: IReduxState) => state.documents);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<ITableData>({ prompt: [], sql: [] });

  const handlePromptResult = (event: string): void => {
    const { result } = JSON.parse(event);
    setTableData({ ...tableData, prompt: result });
  };

  const handleQueryResult = (filteredDocuments: Record<string, unknown>[]): void => {
    setTableData({ ...tableData, sql: filteredDocuments });
  };

  useEffect(() => {
    if (documents.length > 0) {
      setTableData((data) => ({ ...data, sql: documents }));
      setActiveTab(1);
    }
  }, [documents]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      <header className="bg-white flex justify-between border-b border-gray-200 px-4 py-2">
        <h1 className="text-2xl font-bold">Query Dashboard</h1>

        <div className="text-blue-500">{authUser?.email}</div>
      </header>

      <div className="flex">
        <div className="flex-1 flex flex-col w-[200px]">
          <div className="flex border-b border-gray-200 h-10">
            {tabs.map((tab: ITab, index: number) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 border-b-2 cursor-pointer ${
                  activeTab === index ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="h-60">
            {activeTab === 0 ? (
              <PromptEditor onLoadingChange={(loading) => setIsLoading(loading)} onPromptResult={handlePromptResult} />
            ) : (
              <SqlEditor onLoadingChange={(loading) => setIsLoading(loading)} onQueryResult={handleQueryResult} />
            )}
          </div>

          {tableData.prompt && activeTab === 0 && <ResultTable tableResult={tableData.prompt} isLoading={isLoading} />}
          {tableData.sql && activeTab === 1 && <ResultTable tableResult={tableData.sql} isLoading={isLoading} />}
        </div>
        <DataSourceSidebar />
      </div>
    </div>
  );
};

export default Dashboard;
