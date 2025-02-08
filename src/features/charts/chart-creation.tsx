import { FC, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../store';
import { IReduxState } from '../../store/store.interface';
import { IChartConfiguration, IChartInfo, IChartResult } from './interfaces/chart.interface';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DropdownOption } from '../../shared/components/custom-dropdown';
import { IDatasource } from '../datasources/interfaces/datasource.interface';
import ChartConfiguration from './components/chart-configuration';
import ChartPreview from './components/chart-preview';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_AI_CHART_PROMPT_CONFIG } from './graphql/aiCharts';
import { ToastService } from '../../shared/services/toast.service';
import { eventBus } from '../../shared/events';
import { EventType } from '../../shared/events/types';
import { CREATE_NEW_CHART, GET_CHARTS_INFO, UPDATE_CHART } from './graphql/chartInfo';
import { getLocalStorageItem } from '../../shared/utils/utils';

const ChartCreation: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const rootDatasource = useAppSelector((state: IReduxState) => state.datasource);
  const [chartResult, setChartResult] = useState<IChartResult | null>(null);
  const [chartInfo, setChartInfo] = useState<IChartInfo | null>(null);

  const dropdownOptions = useRef<DropdownOption[]>([]);
  const sqlQuery = useRef<string>('No generated SQL query yet.');
  const prompt = useRef<string>('');
  const isLoading = useRef<boolean>(false);
  const queryData = useRef<Record<string, unknown>[]>([]);
  const chartInfoId = useRef<string>('');
  const chartConfigDataRef = useRef<IChartResult | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [generateChart] = useLazyQuery(GET_AI_CHART_PROMPT_CONFIG, {
    fetchPolicy: 'no-cache'
  });
  const [getChartInfo] = useLazyQuery(GET_CHARTS_INFO, {
    fetchPolicy: 'no-cache'
  });
  const [createNewChartInfo] = useMutation(CREATE_NEW_CHART, {
    fetchPolicy: 'no-cache'
  });
  const [updateChart] = useMutation(UPDATE_CHART, {
    fetchPolicy: 'no-cache'
  });

  const isEditPage = location.pathname.includes('/charts/edit');
  dropdownOptions.current = rootDatasource.dataSource.map((datasource: IDatasource) => {
    return {
      id: datasource.id,
      value: datasource.projectId,
      label: datasource.projectId
    };
  });

  const getCreatedChartInfo = useCallback(
    async (chartId: string) => {
      const toastService = new ToastService();
      try {
        const { data } = await getChartInfo({ variables: { chartId } });
        const result = data?.getChartInfo;
        setChartInfo(result);
        const {
          id,
          sql,
          chartName,
          xAxis,
          yAxis,
          chartType,
          chartData,
          prompt: promptData,
          queryData: qData
        } = result as IChartInfo;
        chartInfoId.current = id!;
        const sqlData = sql.replace(/\n/g, ' ');
        sqlQuery.current = sqlData.replace(/\s+/g, ' ');
        prompt.current = promptData;
        queryData.current = JSON.parse(qData);
        const obj = {
          xAxis,
          yAxis,
          title: chartName,
          type: chartType,
          data: JSON.parse(chartData)
        };
        setChartResult(obj);
        chartConfigDataRef.current = obj;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toastService.show('Failed to return chart data.', 'error');
      } finally {
        isLoading.current = false;
      }
    },
    [getChartInfo]
  );

  const getAIChartData = useCallback(
    async (info: IChartConfiguration) => {
      const toastService = new ToastService();
      try {
        isLoading.current = true;
        const result = await generateChart({
          variables: {
            info
          }
        });
        const generatedResult = result?.data?.generateChart;
        const { sql, promptResult, queryResult } = JSON.parse(generatedResult);
        const chartInputResult = promptResult.input.chart;
        const obj = {
          ...chartInputResult,
          type: promptResult.input.chartType
        };
        setChartResult(obj);
        chartConfigDataRef.current = obj;
        const sqlData = sql.replace(/\n/g, ' ');
        sqlQuery.current = sqlData.replace(/\s+/g, ' ');
        queryData.current = queryResult;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toastService.show('Failed to return chart data.', 'error');
      } finally {
        isLoading.current = false;
      }
    },
    [generateChart]
  );

  const saveChart = useCallback(
    async (event: IChartInfo) => {
      const toastService = new ToastService();
      try {
        const activeProject = getLocalStorageItem('activeProject');
        const info: IChartInfo = {
          ...event,
          ...(isEditPage && {
            id: chartInfoId.current
          }),
          datasourceId: activeProject.id,
          userId: authUser.id,
          queryData: JSON.stringify(queryData.current),
          prompt: prompt.current,
          sql: sqlQuery.current
        };

        await (isEditPage
          ? updateChart({ variables: { chartId: info.id, data: info } })
          : createNewChartInfo({ variables: { data: info } }));
        toastService.show(`Chart ${isEditPage ? 'updated' : 'saved'} successfully.`, 'success');
        navigate('/charts');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toastService.show('Failed to return chart data.', 'error');
      }
    },
    [authUser.id, createNewChartInfo, isEditPage, navigate, updateChart]
  );

  useEffect(() => {
    if (params && params.chartId) {
      getCreatedChartInfo(params.chartId);
    }

    eventBus.subscribe(EventType.GENERATE_CHART, (payload: unknown) => {
      const chartPayload = payload as IChartConfiguration;
      prompt.current = chartPayload.userPrompt;
      getAIChartData(chartPayload);
    });

    const handleSaveChart = (payload: unknown): void => {
      saveChart(payload as IChartInfo);
    };

    eventBus.subscribe(EventType.SAVE_CHART, handleSaveChart);

    eventBus.subscribe(EventType.CHART_CHANGE, (payload: unknown) => {
      const chartPayload = payload as IChartResult;
      if (chartConfigDataRef.current?.type !== 'number' && chartPayload.type === 'number') {
        setChartResult(chartPayload);
      } else {
        setChartResult({
          ...chartConfigDataRef.current,
          type: chartPayload.type
        } as IChartResult);
      }
    });

    return () => {
      eventBus.unsubscribe(EventType.GENERATE_CHART, () => {});
      eventBus.unsubscribe(EventType.SAVE_CHART, handleSaveChart);
      eventBus.unsubscribe(EventType.CHART_CHANGE, () => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoading.current && (
        <div className="absolute z-50 w-full h-full bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"
            role="status"
            aria-label="Loading"
          ></div>
        </div>
      )}

      <div className="mx-auto w-full h-full flex">
        <div className="w-full min-h-screen overflow-y-auto bg-white pl-16">
          <div className="px-8 py-4 relative h-full overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{isEditPage ? 'Edit Chart' : 'Create New Chart'}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Select your data source and describe the chart you want to create
                </p>
              </div>
              <button
                onClick={() => navigate('/charts')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-hidden cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100%-80px)]">
              <div className="lg:col-span-4">
                <ChartConfiguration
                  dropdownOptions={dropdownOptions.current}
                  datasources={rootDatasource}
                  chartInfo={chartInfo}
                  chartConfig={chartResult}
                  chartConfigData={chartConfigDataRef.current}
                />
              </div>
              <div className="lg:col-span-8">
                <ChartPreview chartConfig={chartResult} sqlQuery={sqlQuery.current} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartCreation;
