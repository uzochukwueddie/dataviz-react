import { FC, ReactElement, useEffect, useRef } from 'react';
import { IChartInfo, IChartResult } from '../interfaces/chart.interface';
import hljs from 'highlight.js';
import { eventBus } from '../../../shared/events';
import { EventType } from '../../../shared/events/types';
import NumberCanvas from './charts/number';
import BarChart from './charts/bar';
import LineChart from './charts/line';
import PieChart from './charts/pie';

interface IChartPreview {
  sqlQuery: string;
  chartConfig: IChartResult | null;
}

const ChartPreview: FC<IChartPreview> = ({ sqlQuery, chartConfig }): ReactElement => {
  const number = useRef<number>(0);
  const codePreRef = useRef<HTMLPreElement>(null);
  if (chartConfig && chartConfig.type === 'number') {
    const { data } = chartConfig as IChartResult;
    number.current = data as number;
  }

  const saveChart = (): void => {
    const { data, title, xAxis, yAxis, type } = chartConfig as IChartResult;
    const info: IChartInfo = {
      datasourceId: '',
      userId: '',
      chartName: title,
      chartType: type,
      xAxis,
      yAxis,
      queryData: '',
      chartData: JSON.stringify(data),
      prompt: '',
      sql: ''
    };
    eventBus.publish(EventType.SAVE_CHART, info);
  };

  useEffect(() => {
    if (codePreRef.current) {
      const preElement = codePreRef.current;
      const codeElement = preElement.querySelector('code');
      if (codeElement) {
        codeElement.removeAttribute('data-highlighted');
      }
      hljs.highlightAll();
    }
  }, [chartConfig]);

  return (
    <div className="border border-gray-200 h-full p-4 rounded-lg">
      <div className="bg-gray-50 rounded-lg font-mono text-sm overflow-x-auto mb-2">
        <pre ref={codePreRef}>
          <code className="language-sql">{sqlQuery}</code>
        </pre>
      </div>

      <div className="h-full py-4 sticky z-10">
        <div className="mb-2">
          <div className="flex gap-2">
            <button
              disabled={!chartConfig}
              onClick={saveChart}
              className="px-4 py-1 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Chart
            </button>
          </div>
        </div>

        {chartConfig !== null && (
          <div className="w-full flex items-center justify-center font-semibold text-gray-500">
            {chartConfig?.title}
          </div>
        )}

        <div className="relative h-full w-full flex items-center justify-center">
          {!chartConfig && (
            <div className="text-center w-full h-full flex flex-col justify-center text-gray-500">
              <i className="fa fa-chart-column mx-auto text-3xl"></i>
              <p className="mt-2">Configure your chart to see the preview</p>
            </div>
          )}

          {chartConfig && chartConfig.type === 'number' && <NumberCanvas number={number.current} />}
          {chartConfig && chartConfig.type === 'bar' && <BarChart chartData={chartConfig} />}
          {chartConfig && chartConfig.type === 'line' && <LineChart chartData={chartConfig} />}
          {chartConfig && chartConfig.type === 'pie' && <PieChart chartData={chartConfig} />}
        </div>
      </div>
    </div>
  );
};

export default ChartPreview;
