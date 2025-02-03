import { ChangeEvent, FC, FormEvent, ReactElement, useEffect, useState } from 'react';
import { IPostgreSQLDatasource } from '../interfaces/datasource.interface';
import clsx from 'clsx';
import { eventBus } from '../../../shared/events';
import { EventType } from '../../../shared/events/types';
import { decodeBase64String } from '../../../shared/utils/utils';

interface DataSourceFormProps {
  datasource?: IPostgreSQLDatasource;
  onCancel: () => void;
}

const DataSourceForm: FC<DataSourceFormProps> = ({ datasource, onCancel }): ReactElement => {
  const [formData, setFormData] = useState<IPostgreSQLDatasource>({
    projectId: '',
    databaseName: '',
    databaseUrl: '',
    username: '',
    password: '',
    port: ''
  });

  const isValid =
    Object.values(formData).every((value) => value.length > 0 && value.trim() !== '') &&
    formData.port.length >= 4 &&
    formData.port.length <= 6;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = (): void => {
    setFormData({
      projectId: '',
      databaseName: '',
      databaseUrl: '',
      username: '',
      password: '',
      port: ''
    });
    onCancel();
  };

  const handleTestDatasourceConnection = (): void => {
    if (isValid) {
      eventBus.publish(EventType.POSTGRESQL_DATASOURCE_TEST, formData);
    }
  };

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();
    if (isValid) {
      eventBus.publish(EventType.POSTGRESQL_DATASOURCE_SAVE, {
        ...formData,
        ...(datasource && {
          id: datasource.id,
          userId: datasource.userId
        })
      });
    }
  };

  useEffect(() => {
    if (datasource) {
      const { projectId, port, databaseName, databaseUrl, username, password } = datasource;

      setFormData({
        projectId: projectId || '',
        databaseUrl: decodeBase64String(databaseUrl) || '',
        port: port || '',
        databaseName: decodeBase64String(databaseName) || '',
        username: decodeBase64String(username) || '',
        password: decodeBase64String(password) || ''
      });
    }
  }, [datasource]);

  return (
    <form onSubmit={handleSubmit} className="p-6" autoComplete="off">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Connection Identifier</label>
          <input
            type="text"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className="mt-1 py-1 block w-full border-gray-300 shadow-xs focus:outline-none"
            placeholder="Ex: dataviz-pg-connection"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Host address</label>
          <input
            type="text"
            name="databaseUrl"
            value={formData.databaseUrl}
            onChange={handleChange}
            className="mt-1 py-1 block w-full border-gray-300 shadow-xs focus:outline-none"
            placeholder="My Database Connection"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Port</label>
          <input
            type="text"
            name="port"
            value={formData.port}
            onChange={handleChange}
            className="mt-1 py-1 block w-full border-gray-300 shadow-xs focus:outline-none"
            placeholder="5432"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Database Name</label>
          <input
            type="text"
            name="databaseName"
            value={formData.databaseName}
            onChange={handleChange}
            className="mt-1 py-1 block w-full border-gray-300 shadow-xs focus:outline-none"
            placeholder="my_database"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="new-username"
            placeholder="Username"
            className="mt-1 py-1 block w-full border-gray-300 shadow-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="********"
            className="mt-1 py-1 block w-full border-gray-300 shadow-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center w-full justify-between space-x-4 mt-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-500 font-bold text-white text-sm px-4 py-2 cursor-pointer hover:bg-red-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={clsx('font-bold text-sm px-4 py-2 border transition-colors text-white', {
              'bg-blue-500 cursor-pointer hover:bg-blue-400': isValid,
              'bg-blue-300 pointer-events-none': !isValid
            })}
          >
            Save
          </button>
        </div>
        <button
          type="button"
          onClick={handleTestDatasourceConnection}
          className={clsx('font-bold text-sm px-4 py-2 border transition-colors text-white', {
            'bg-blue-500 cursor-pointer hover:bg-blue-400': isValid,
            'bg-blue-300 pointer-events-none': !isValid
          })}
        >
          Test Connection
        </button>
      </div>
    </form>
  );
};

export default DataSourceForm;
