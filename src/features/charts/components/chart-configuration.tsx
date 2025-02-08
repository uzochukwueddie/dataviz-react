import { ChangeEvent, FC, ReactElement, useEffect, useRef, useState } from 'react';
import { ChartType, IChartConfiguration, IChartInfo, IChartResult } from '../interfaces/chart.interface';
import CustomDropdown, { DropdownOption } from '../../../shared/components/custom-dropdown';
import { IAppDataSource, IDatasource } from '../../datasources/interfaces/datasource.interface';
import { eventBus } from '../../../shared/events';
import { EventType } from '../../../shared/events/types';
import { setLocalStorageItem } from '../../../shared/utils/utils';
import clsx from 'clsx';

const CHART_TYPES: ChartType[] = [
  { name: 'number', icon: 'fa-brands fa-creative-commons-zero' },
  { name: 'bar', icon: 'fa fa-chart-column' },
  { name: 'line', icon: 'fa fa-chart-line' },
  { name: 'pie', icon: 'fa fa-chart-pie' }
];

interface IChartConfigType {
  dropdownOptions: DropdownOption[];
  datasources: IAppDataSource | null;
  chartInfo: IChartInfo | null;
  chartConfig: IChartResult | null;
  chartConfigData: IChartResult | null;
}

const ChartConfiguration: FC<IChartConfigType> = ({
  dropdownOptions,
  datasources,
  chartInfo,
  chartConfig,
  chartConfigData
}): ReactElement => {
  const [config, setConfig] = useState<IChartConfiguration>({
    projectId: '',
    userPrompt: '',
    chartType: ''
  });
  const defaultProject = useRef<DropdownOption | null>(null);

  const isConfigValid = (): boolean => {
    return Boolean(config.projectId && config.chartType && config.userPrompt.trim());
  };

  const handleDropdownChange = (option: DropdownOption): void => {
    setConfig({ ...config, projectId: option.value });
    const selectedDatasource = datasources?.dataSource.find((source: IDatasource) => source.id === option.id);
    setLocalStorageItem('activeProject', JSON.stringify(selectedDatasource));
  };

  const calculateTotal = (chart: IChartResult): number => {
    const data = chart.data as Record<string, unknown>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.reduce((prev, curr: any) => prev + curr[chart.yAxis], 0);
  };

  const selectChartType = (type: ChartType): void => {
    setConfig({ ...config, chartType: type.name });
    if (chartConfig && chartConfig.type !== 'number' && type.name !== 'pie') {
      const chart = {
        ...chartConfig,
        type: type.name,
        ...(type.name === 'number' && {
          data: calculateTotal(chartConfig)
        })
      };
      eventBus.publish(EventType.CHART_CHANGE, chart);
    }

    if (chartConfig && chartConfig.type === 'number' && Array.isArray(chartConfigData?.data) && type.name !== 'pie') {
      eventBus.publish(EventType.CHART_CHANGE, {
        ...chartConfigData,
        type: type.name
      });
    }
  };

  const generateChart = (): void => {
    if (isConfigValid()) {
      eventBus.publish(EventType.GENERATE_CHART, config);
    }
  };

  const firstLetterUpper = (text: string): string => `${text.charAt(0).toUpperCase()}${text.substring(1)}`;

  useEffect(() => {
    if (chartInfo) {
      const { id, projectId, prompt, chartType } = chartInfo as IChartInfo;
      setConfig({
        projectId: projectId!,
        userPrompt: prompt,
        chartType
      });
      defaultProject.current = {
        id: id!,
        label: projectId!,
        value: projectId!
      };
    }
  }, [chartInfo]);

  return (
    <div className="bg-white inherit rounded-lg border border-gray-200 px-4 py-2 z-10">
      <h2 className="text-lg font-semibold mb-4">Chart Configuration</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
        <CustomDropdown
          options={dropdownOptions}
          dropdownMessage="No datasource"
          placeholder="Select datasource"
          defaultOption={defaultProject.current}
          onSelect={handleDropdownChange}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CHART_TYPES.map((type: ChartType) => (
            <button
              key={type.name}
              onClick={() => selectChartType(type)}
              className={clsx('flex flex-col items-center p-3 cursor-pointer border rounded-lg hover:bg-gray-50', {
                'bg-blue-50 border-blue-500 text-blue-700': config.chartType === type.name,
                'border-gray-200': config.chartType !== type.name
              })}
            >
              <i className={type.icon}></i>
              {firstLetterUpper(type.name)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
        <div className="relative">
          <textarea
            value={config.userPrompt}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setConfig({ ...config, userPrompt: event.target.value });
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden"
            placeholder="Example: Show me monthly sales trends as a bar chart with revenue on the y-axis"
          ></textarea>
        </div>
      </div>

      <button
        disabled={!isConfigValid()}
        onClick={generateChart}
        className="w-full px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Chart
      </button>
    </div>
  );
};

export default ChartConfiguration;
