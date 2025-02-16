/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ReactElement, useEffect, useRef } from 'react';
import { IChartResult } from '../../interfaces/chart.interface';
import { Chart, registerables } from 'chart.js';
import { truncateText } from '../../../../shared/utils/utils';

// Register Chart.js components
Chart.register(...registerables);

const BarChart: FC<{ chartData: IChartResult | null; previewWidth: number }> = ({
  chartData,
  previewWidth
}): ReactElement => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartData || !chartRef.current) return;

    const { data, xAxis, yAxis } = chartData;
    const ctx: CanvasRenderingContext2D = chartRef.current.getContext('2d') as CanvasRenderingContext2D;
    const chartInfoData = data as Record<string, unknown>[];

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartInfoData.map((item) => truncateText(item[xAxis] as string, 10)),
        datasets: [
          {
            label: yAxis,
            data: chartInfoData.map((item) => item[yAxis]),
            backgroundColor: '#60A5FA', // Tailwind blue-400
            borderColor: '#3B82F6', // Tailwind blue-500
            borderWidth: 1,
            borderRadius: 5,
            barThickness: 40
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                family: "'Inter', sans-serif",
                size: 14
              },
              generateLabels: (chart) => {
                const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                return original.map((label) => ({
                  ...label,
                  text: truncateText(label.text, 20)
                }));
              }
            }
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems: any) => {
                const dataIndex = tooltipItems[0].dataIndex;
                return chartInfoData[dataIndex][xAxis] as any;
              },
              label: (context: any) => {
                return context.raw;
              }
            },
            padding: 12,
            backgroundColor: 'rgba(17, 24, 39, 0.8)', // Tailwind gray-900 with opacity
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: yAxis,
              font: {
                family: "'Inter', sans-serif",
                size: 14
              }
            }
          },
          x: {
            title: {
              display: true,
              text: xAxis,
              font: {
                family: "'Inter', sans-serif",
                size: 14
              }
            },
            ticks: {
              autoSkip: true
            }
          }
        }
      }
    }) as Chart;

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div className="min-h-[550px] relative" style={{ width: `${previewWidth}vw` }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarChart;
