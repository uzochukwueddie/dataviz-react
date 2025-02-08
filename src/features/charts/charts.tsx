import { FC, ReactElement, useEffect, useState } from 'react';
import { useAppSelector } from '../../store';
import { IReduxState } from '../../store/store.interface';
import { IChartInfo } from './interfaces/chart.interface';
import { useNavigate } from 'react-router-dom';
import { FetchResult, useMutation, useQuery } from '@apollo/client';
import { DELETE_CHART, GET_CHARTS } from './graphql/chartInfo';
import clsx from 'clsx';
import { ToastService } from '../../shared/services/toast.service';
import ChartGrid from './components/chart-grid';

const Charts: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const [charts, setCharts] = useState<IChartInfo[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<IChartInfo[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();
  const filters: string[] = ['All', 'Number', 'Bar', 'Line', 'Pie'];
  const { data, error, loading } = useQuery(GET_CHARTS, {
    fetchPolicy: 'no-cache',
    variables: { userId: authUser.id }
  });
  const [deleteChart] = useMutation(DELETE_CHART, {
    fetchPolicy: 'no-cache'
  });

  const createNewChart = (): void => {
    navigate('/charts/create');
  };

  const toggleFilter = (filter: string): void => {
    setActiveFilter(filter);
    filter = filter.toLowerCase();
    if (filter === 'all') {
      setFilteredCharts(charts);
    } else {
      const filtered: IChartInfo[] = charts.filter((chart: IChartInfo) => chart.chartType === filter);
      setFilteredCharts(filtered);
    }
  };

  const deleteCreatedChart = async (chartId: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this chart?')) {
      const toastService = new ToastService();
      try {
        const result: FetchResult = await deleteChart({ variables: { chartId } });
        if (result && result.data) {
          const { id } = result.data.deleteChart;
          const updatedCharts: IChartInfo[] = charts.filter((chart: IChartInfo) => chart.id !== id);
          setCharts(updatedCharts);
          setFilteredCharts(updatedCharts);
          toastService.show('Chart deleted successfully.', 'success');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toastService.show('Error deleting chart.', 'error');
      }
    }
  };

  useEffect(() => {
    if (data && !error) {
      const { getCharts } = data;
      setCharts(getCharts);
      setFilteredCharts(getCharts);
    }
  }, [data, error]);

  return (
    <div className="px-4 py-2 h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Charts</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your saved charts</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={createNewChart}
            className="bg-blue-600 cursor-pointer text-white px-4 py-1 gap-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <i className="fa fa-plus"></i>
            Create Chart
          </button>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-4">
        {filters.map((filter: string) => (
          <button
            key={filter}
            onClick={() => toggleFilter(filter)}
            className={clsx(
              'px-4 py-2 cursor-pointer rounded-full border border-gray-200 hover:bg-blue-100 focus:outline-hidden',
              {
                'bg-blue-100 text-blue-800': activeFilter === filter
              }
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredCharts.length > 0 && !loading && (
        <ChartGrid charts={filteredCharts} deleteCreatedChart={deleteCreatedChart} />
      )}

      {filteredCharts.length === 0 && !loading && (
        <div className="mt-8 text-center">
          <i className="fa fa-chart-column text-4xl"></i>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No charts found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new chart.</p>
          <div className="mt-2 flex items-center justify-center">
            <button
              onClick={createNewChart}
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 gap-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <i className="fa fa-plus"></i>
              Create New Chart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;
