import { FC, ReactElement, useState } from 'react';
import { IChartDataView, IChartInfo } from '../interfaces/chart.interface';
import { useNavigate } from 'react-router-dom';
import ChartDataModal from './chart-modal';

type IChartGrid = {
  charts: IChartInfo[];
  deleteCreatedChart: (chartId: string) => Promise<void>;
};

const ChartGrid: FC<IChartGrid> = ({ charts, deleteCreatedChart }): ReactElement => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedChart, setSelectedChart] = useState<IChartDataView>({ title: '', chartData: [] });
  const navigate = useNavigate();

  const chartIcon = (chart: IChartInfo): string => {
    if (chart.chartType === 'bar') {
      return 'fa fa-chart-column';
    } else if (chart.chartType === 'line') {
      return 'fa fa-chart-line';
    } else if (chart.chartType === 'number') {
      return 'fa-brands fa-creative-commons-zero';
    } else if (chart.chartType === 'pie') {
      return 'fa fa-chart-pie';
    } else {
      return 'fa fa-chart-column';
    }
  };

  const openModal = (chart: IChartInfo): void => {
    console.log(chart);
    setSelectedChart({
      title: chart.chartName,
      chartData: chart.chartType !== 'number' ? JSON.parse(chart.chartData) : JSON.parse(chart.queryData)
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const updateChart = (chartId: string | undefined): void => {
    navigate(`/charts/edit/${chartId}`);
  };

  const toUpper = (type: string): string => type.toUpperCase();

  return (
    <>
      {showModal && <ChartDataModal chartData={selectedChart} onClose={closeModal} />}
      <div className="mx-auto w-full h-full flex">
        <div className="h-full overflow-y-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {charts.map((chart: IChartInfo) => (
              <div key={chart.id} className="bg-white px-3 py-2 rounded-lg border border-gray-200 w-full">
                <div className="flex gap-2 mb-1">
                  <div className="text-ellipsis truncate w-full flex gap-1 items-center" title={chart.chartName}>
                    <i className={chartIcon(chart)} />
                    <div className="flex items-center justify-between gap-3 w-full">
                      <h2 className="font-semibold text-sm text-ellipsis truncate max-w-64">{chart.chartName}</h2>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-6">
                  <div className="text-sm text-gray-400 max-w-32 truncate" title={chart.projectId}>
                    {chart.projectId}
                  </div>
                  <span className="text-gray-400 mb-1">|</span>
                  <span className="text-[12px] text-gray-400 text-ellipsis truncate">{toUpper(chart.chartType)}</span>
                </div>

                <div className="flex items-center justify-between w-full">
                  <i
                    onClick={() => openModal(chart)}
                    className="fa fa-eye flex justify-start px-2 py-1 text-blue-500 cursor-pointer font-bold text-sm"
                  ></i>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => updateChart(chart.id)}
                      className="px-1 rounded hover:bg-green-200 transition-colors duration-200 cursor-pointer"
                    >
                      <i className="fa fa-pen text-green-500 hover:text-green-600 transition-colors duration-200"></i>
                    </button>

                    <button
                      onClick={() => deleteCreatedChart(chart.id!)}
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
    </>
  );
};

export default ChartGrid;
