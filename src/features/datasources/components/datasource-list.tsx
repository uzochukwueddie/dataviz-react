import { FC, ReactElement } from 'react';
import { IDatasource } from '../interfaces/datasource.interface';

interface IDataSourceGrid {
  dataSources: IDatasource[];
  onEdit: (projectId: string) => void;
  onDelete: (id: string) => void;
}

const DataSourceGrid: FC<IDataSourceGrid> = ({ dataSources = [], onEdit, onDelete }): ReactElement => {
  if (dataSources.length === 0) {
    return (
      <div className="mx-auto w-full h-[200px] flex items-center justify-center">
        <span className="text-gray-400">You have not created any data source.</span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full h-full flex">
      <div className="h-full overflow-y-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {dataSources.map((source: IDatasource) => (
            <div key={source.id} className="bg-white px-3 py-2 rounded-lg border border-gray-200 w-full">
              <div className="flex gap-2 mb-6">
                <div className="text-ellipsis truncate w-full flex gap-1 items-center" title={source.projectId}>
                  <i className="fa fa-database"></i>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <h2 className="font-semibold text-sm text-ellipsis truncate max-w-64">{source.projectId}</h2>
                    <span className="text-[10px] text-ellipsis truncate max-w-60" title={source.type.toUpperCase()}>
                      {source.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end w-full">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit(source.projectId)}
                    className="px-1 rounded hover:bg-green-200 transition-colors duration-200 cursor-pointer"
                  >
                    <i className="fa fa-pen text-green-500 hover:text-green-600 transition-colors duration-200"></i>
                  </button>
                  <button
                    onClick={() => onDelete(source.id)}
                    className="px-1 rounded hover:bg-red-200 transition-colors duration-200 cursor-pointer"
                  >
                    <i className="fa fa-trash-can text-red-500 transition-colors duration-200 hover:text-red-600"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataSourceGrid;
