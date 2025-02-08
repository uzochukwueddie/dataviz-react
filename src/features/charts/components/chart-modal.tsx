import { FC, ReactElement, ReactNode } from 'react';
import { IChartDataView } from '../interfaces/chart.interface';

const ChartDataModal: FC<{ chartData: IChartDataView; onClose: () => void }> = ({
  chartData,
  onClose
}): ReactElement => {
  const keys = chartData.chartData.length > 0 ? Object.keys(chartData.chartData[0]) : [];

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full h-[75%] max-w-2xl">
        <div className="flex justify-between items-center p-6">
          <div>
            <h2 className="text-xl font-bold">Chart Data</h2>
            {chartData.title && <p className="text-sm font-bold mb-2">{chartData.title}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 cursor-pointer hover:text-gray-600">
            <i className="fa fa-xmark"></i>
          </button>
        </div>
        <div className="px-6">
          <p className="text-sm mb-4">The following chart data is used to render this visualization.</p>
          <div className="bg-gray-100 py-4 overflow-y-scroll max-h-80">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  {keys.map((key) => (
                    <th key={key} className="text-left pb-2 px-4 whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.chartData.map((item: Record<string, unknown>, index: number) => (
                  <tr key={index} className="border-b border-gray-300 last:border-b-0">
                    {keys.map((column) => (
                      <td
                        key={`${index}-${column}`}
                        className="py-3 px-4 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {item[column] as ReactNode}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDataModal;
